from fastapi import FastAPI

app = FastAPI()

items = []

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}

@app.post("/items")
def setItem(item : str):
    items.append(item)
    return items

@app.get("/items/{itemsID}")
def getItem(itemsID : int):
    item = items[itemsID]
    return item




# uvicorn CreatAPI:app --reload