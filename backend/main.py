# FastAPI backend entry point
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS for local frontend (Vite dev server and Docker)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"]
)

class TripCreateRequest(BaseModel):
    trip_name: str
    participants: List[str]
    user_email: str  # Now required, no default

trips_db = []  # In-memory storage for trips

@app.post("/trips")
def create_trip(trip: TripCreateRequest):
    if not trip.trip_name.strip():
        raise HTTPException(status_code=400, detail="Trip name is required.")
    participants_clean = [p for p in trip.participants if p.strip()]
    if len(participants_clean) < 2:
        raise HTTPException(status_code=400, detail="At least 2 participants required.")
    if not trip.user_email:
        raise HTTPException(status_code=400, detail="User email is required.")
    trip_data = {
        "trip_name": trip.trip_name,
        "participants": participants_clean,
        "user_email": trip.user_email
    }
    trips_db.append(trip_data)
    return {
        "message": "Trip created successfully!",
        **trip_data
    }

@app.get("/trips")
def get_trips(user_email: str):  # Now required, no default
    if not user_email:
        raise HTTPException(status_code=400, detail="User email is required as a query parameter.")
    return [trip for trip in trips_db if trip["user_email"] == user_email]

@app.delete("/trips/{trip_name}")
def delete_trip(trip_name: str, user_email: str):  # user_email already required
    if not user_email:
        raise HTTPException(status_code=400, detail="User email is required as a query parameter.")
    # Find the trip by name and user_email
    for i, trip in enumerate(trips_db):
        if trip["trip_name"] == trip_name and trip["user_email"] == user_email:
            del trips_db[i]
            return {"message": f"Trip '{trip_name}' deleted successfully."}
    raise HTTPException(status_code=404, detail="Trip not found or you do not have permission to delete it.")

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI backend!"}
