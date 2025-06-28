from fastapi import APIRouter, HTTPException, status, Depends, Header
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from auth_schema import UserCreate, UserLogin, User
from database import get_db, UserModel
from fastapi.responses import JSONResponse
from fastapi import Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import os

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter()

security = HTTPBearer()

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/signup", response_model=User, status_code=201)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
        if db_user:
            return JSONResponse(status_code=400, content={"error": "이미 등록된 이메일입니다.", "details": "중복 이메일"})
        hashed_password = pwd_context.hash(user.password)
        db_user = UserModel(
            email=user.email,
            password=hashed_password,
            name=user.name,
            role=user.role,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": "회원가입 실패", "details": str(e)})

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if not db_user or not pwd_context.verify(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")
    token_data = {
        "sub": str(db_user.id),
        "email": db_user.email,
        "name": db_user.name,
        "role": db_user.role,
        "iss": "lipcoding",
        "aud": "lipcoding",
        "iat": int(datetime.utcnow().timestamp()),
        "nbf": int(datetime.utcnow().timestamp()),
        "jti": str(db_user.id) + str(datetime.utcnow().timestamp()),
    }
    access_token = create_access_token(token_data)
    return {"token": access_token}

@router.get("/me")
def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        print("[DEBUG] get_current_user 진입")
        print(f"[DEBUG] credentials: {credentials}")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"[DEBUG] payload: {payload}")
        user_id = payload.get("sub")
        print(f"[DEBUG] user_id: {user_id}")
        if user_id is None:
            print("[DEBUG] user_id 없음")
            raise HTTPException(status_code=401, detail="Invalid token")
        db_user = db.query(UserModel).filter(UserModel.id == int(user_id)).first()
        print(f"[DEBUG] db_user: {db_user}")
        if not db_user:
            print("[DEBUG] DB에 사용자 없음")
            raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
        return db_user
    except Exception as e:
        print(f"[DEBUG] get_current_user 예외: {e}")
        raise HTTPException(status_code=401, detail="Could not validate credentials")

class UpdateMentorProfileRequest(BaseModel):
    id: int
    name: str
    role: str
    bio: str
    image: Optional[str] = None
    skills: List[str]

class UpdateMenteeProfileRequest(BaseModel):
    id: int
    name: str
    role: str
    bio: str
    image: Optional[str] = None

@router.put("/profile")
def update_profile(
    data: UpdateMentorProfileRequest | UpdateMenteeProfileRequest,
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
    except JWTError:
        raise HTTPException(status_code=401, detail="토큰이 유효하지 않습니다.")
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    db_user.name = data.name
    db_user.role = data.role
    db_user.introduction = getattr(data, "bio", None)
    db_user.profile_image = getattr(data, "image", None)
    if hasattr(data, "skills"):
        db_user.tech_stack = ",".join(data.skills)
    db.commit()
    db.refresh(db_user)
    return db_user
