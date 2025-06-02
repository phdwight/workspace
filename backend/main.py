# FastAPI backend entry point
from fastapi import FastAPI, HTTPException, Request, Path
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from uuid import uuid4

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
            # Also delete all expenses for this trip and user
            global expenses_db
            expenses_db = [e for e in expenses_db if not (e.get("trip_name") == trip_name and e.get("user_email") == user_email)]
            return {"message": f"Trip '{trip_name}' and all related data deleted successfully."}
    raise HTTPException(status_code=404, detail="Trip not found or you do not have permission to delete it.")

class ExpenseCreateRequest(BaseModel):
    payer: str
    amount: float
    participants: List[str]
    date: Optional[str] = None
    user_email: str
    trip_name: Optional[str] = None

expenses_db = []  # In-memory storage for expenses

# Assign unique IDs to expenses for editing/deleting
@app.post("/expenses")
def create_expense(expense: ExpenseCreateRequest):
    if not expense.payer or not expense.payer.strip():
        raise HTTPException(status_code=400, detail="Payer is required.")
    if not expense.amount or expense.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than 0.")
    participants_clean = [p for p in expense.participants if p.strip()]
    if len(participants_clean) == 0:
        raise HTTPException(status_code=400, detail="At least one participant is required.")
    if not expense.user_email:
        raise HTTPException(status_code=400, detail="User email is required.")
    expense_data = {
        "id": str(uuid4()),  # assign a unique id
        "payer": expense.payer,
        "amount": expense.amount,
        "participants": participants_clean,
        "date": expense.date,
        "user_email": expense.user_email,
        "trip_name": expense.trip_name
    }
    expenses_db.append(expense_data)
    return {"message": "Expense added!", **expense_data}

@app.put("/expenses/{expense_id}")
def update_expense(expense_id: str = Path(...), expense: ExpenseCreateRequest = None, user_email: str = None):
    # Find the expense by id and user_email
    for i, exp in enumerate(expenses_db):
        if exp.get("id") == expense_id and exp.get("user_email") == (user_email or expense.user_email):
            # Update fields
            participants_clean = [p for p in expense.participants if p.strip()]
            expenses_db[i].update({
                "payer": expense.payer,
                "amount": expense.amount,
                "participants": participants_clean,
                "date": expense.date,
                "trip_name": expense.trip_name
            })
            return expenses_db[i]
    raise HTTPException(status_code=404, detail="Expense not found or you do not have permission to edit it.")

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: str = Path(...), user_email: str = None):
    # Find the expense by id and user_email
    for i, exp in enumerate(expenses_db):
        if exp.get("id") == expense_id and exp.get("user_email") == user_email:
            del expenses_db[i]
            return {"message": "Expense deleted successfully."}
    raise HTTPException(status_code=404, detail="Expense not found or you do not have permission to delete it.")

@app.get("/expenses")
def get_expenses(trip_name: Optional[str] = None, user_email: Optional[str] = None):
    # Only return expenses for the given trip and user
    results = expenses_db
    if trip_name:
        results = [e for e in results if e.get("trip_name") == trip_name]
    if user_email:
        results = [e for e in results if e.get("user_email") == user_email]
    return results

@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI backend!"}
