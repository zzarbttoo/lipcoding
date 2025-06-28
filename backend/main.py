from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from database import Base, engine, get_db, UserModel, MatchRequestModel
from sqlalchemy.orm import Session
from fastapi import Security
from fastapi.security import HTTPAuthorizationCredentials
from auth_schema import MatchRequestCreate, MatchRequest

import os

app = FastAPI()

# CORS 설정 (프론트엔드와 연동을 위해)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 테이블 생성
Base.metadata.create_all(bind=engine)

app.include_router(auth_router, prefix="/api")

@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")

@app.get("/api")
def read_root():
    return {"Hello": "World"}

@app.get("/api/images/{role}/{id}")
def get_profile_image(role: str, id: int, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == id, UserModel.role == role).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    if user.profile_image and os.path.exists(user.profile_image):
        return FileResponse(user.profile_image)
    # 기본 이미지 제공
    if role == "mentor":
        return RedirectResponse("https://placehold.co/500x500.jpg?text=MENTOR")
    else:
        return RedirectResponse("https://placehold.co/500x500.jpg?text=MENTEE")

@app.get("/api/mentors")
def get_mentors(skill: str = None, orderBy: str = None, db: Session = Depends(get_db)):
    query = db.query(UserModel).filter(UserModel.role == "mentor")
    if skill:
        query = query.filter(UserModel.tech_stack.like(f"%{skill}%"))
    if orderBy == "skill":
        query = query.order_by(UserModel.tech_stack.asc())
    elif orderBy == "name":
        query = query.order_by(UserModel.name.asc())
    mentors = query.all()
    result = []
    for mentor in mentors:
        result.append({
            "id": mentor.id,
            "email": mentor.email,
            "role": mentor.role,
            "profile": {
                "name": mentor.name,
                "bio": mentor.introduction or "",
                "imageUrl": f"/api/images/mentor/{mentor.id}",
                "skills": mentor.tech_stack.split(",") if mentor.tech_stack else []
            }
        })
    return result

from database import MatchRequestModel
from auth_schema import MatchRequestCreate, MatchRequest
from auth import get_current_user, security
from sqlalchemy.orm import Session
from fastapi import Security
from fastapi.security import HTTPAuthorizationCredentials

@app.post("/api/match-requests", response_model=MatchRequest)
def create_match_request(
    req: MatchRequestCreate,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    print(f"[DEBUG] Authorization header: {credentials.scheme} {credentials.credentials}")
    user = get_current_user(credentials, db)
    # 권한 체크 제거
    exists = db.query(MatchRequestModel).filter(
        MatchRequestModel.mentee_id == user.id,
        MatchRequestModel.mentor_id == req.mentor_id,
        MatchRequestModel.status == "pending"
    ).first()
    if exists:
        raise HTTPException(status_code=400, detail="이미 요청한 멘토입니다.")
    match = MatchRequestModel(
        mentee_id=user.id,
        mentor_id=req.mentor_id,
        message=req.message,
        status="pending"
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    return match

@app.get("/api/match-requests/incoming", response_model=list[MatchRequest])
def get_incoming_match_requests(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    user = get_current_user(credentials, db)
    # 권한 체크 제거
    requests = db.query(MatchRequestModel).filter(MatchRequestModel.mentor_id == user.id).all()
    return requests

@app.get("/api/match-requests/outgoing", response_model=list[MatchRequest])
def get_outgoing_match_requests(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    user = get_current_user(credentials, db)
    # 권한 체크 제거
    requests = db.query(MatchRequestModel).filter(MatchRequestModel.mentee_id == user.id).all()
    return requests

@app.put("/api/match-requests/{id}/accept", response_model=MatchRequest)
def accept_match_request(
    id: int,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    user = get_current_user(credentials, db)
    # 권한 체크 제거
    already_accepted = db.query(MatchRequestModel).filter(
        MatchRequestModel.mentor_id == user.id,
        MatchRequestModel.status == "accepted"
    ).first()
    if already_accepted:
        raise HTTPException(status_code=400, detail="이미 수락한 멘티가 있습니다. 다른 요청을 수락할 수 없습니다.")
    req = db.query(MatchRequestModel).filter(MatchRequestModel.id == id, MatchRequestModel.mentor_id == user.id).first()
    if not req:
        raise HTTPException(status_code=404, detail="요청을 찾을 수 없습니다.")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="이미 처리된 요청입니다.")
    req.status = "accepted"
    db.commit()
    db.refresh(req)
    return req

@app.put("/api/match-requests/{id}/reject", response_model=MatchRequest)
def reject_match_request(
    id: int,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    user = get_current_user(credentials, db)
    # 권한 체크 제거
    req = db.query(MatchRequestModel).filter(MatchRequestModel.id == id, MatchRequestModel.mentor_id == user.id).first()
    if not req:
        raise HTTPException(status_code=404, detail="요청을 찾을 수 없습니다.")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="이미 처리된 요청입니다.")
    req.status = "rejected"
    db.commit()
    db.refresh(req)
    return req

@app.delete("/api/match-requests/{id}")
def delete_match_request(
    id: int,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Security(security)
):
    user = get_current_user(credentials, db)
    # 권한 체크 제거
    req = db.query(MatchRequestModel).filter(MatchRequestModel.id == id, MatchRequestModel.mentee_id == user.id).first()
    if not req:
        raise HTTPException(status_code=404, detail="요청을 찾을 수 없습니다.")
    db.delete(req)
    db.commit()
    return {"detail": "삭제되었습니다."}
