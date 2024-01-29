from flask import Flask, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app) #resources={r'*' : {'origins' : 'http://localhost:4200'}})

@app.route('/')
def index():
    return "return backend home message"

@app.route('/handle_post', methods = ['GET', 'POST'])
def handle_post():
    if request.method == 'POST': 
        data = request.get_json()
        mes = data['name']
        
        return mes
    else: 
        
        return 'returned the backend get message'
    



if __name__ == '__main__':
    app.run(debug = True)