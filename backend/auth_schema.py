from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str  # 'mentor' 또는 'mentee'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    id: int
    email: EmailStr
    name: str
    role: str
    profile_image: Optional[str] = None
    introduction: Optional[str] = None
    tech_stack: Optional[str] = None

class MatchRequestCreate(BaseModel):
    mentor_id: int
    message: str

class MatchRequest(BaseModel):
    id: int
    mentee_id: int
    mentor_id: int
    message: str
    status: str
    created_at: datetime

class MatchRequestUpdate(BaseModel):
    status: str

class UpdateMentorProfileRequest(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    role: Optional[str] = None  # mentor
    bio: Optional[str] = None
    image: Optional[str] = None  # base64 encoded
    skills: Optional[List[str]] = None

class UpdateMenteeProfileRequest(BaseModel):
    id: Optional[int] = None
    name: Optional[str] = None
    role: Optional[str] = None  # mentee
    bio: Optional[str] = None
    image: Optional[str] = None  # base64 encoded

class MentorProfileDetails(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    imageUrl: Optional[str] = None
    skills: Optional[List[str]] = None

class MenteeProfileDetails(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    imageUrl: Optional[str] = None

class MentorProfile(BaseModel):
    id: int
    email: EmailStr
    role: str  # mentor
    profile: MentorProfileDetails

class MenteeProfile(BaseModel):
    id: int
    email: EmailStr
    role: str  # mentee
    profile: MenteeProfileDetails
