from flask import Flask, request, jsonify
from flask_cors import CORS
import datetime
from helperFunctions import * 
from data_parser import *

from flask_jwt_extended import (create_access_token, JWTManager, 
                                jwt_required, get_jwt_identity)


app = Flask(__name__)
app.config['JWT_SECRET_KEY'] = 'secret'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes = 30)
CORS(app) #resources={r'*' : {'origins' : 'http://localhost:4200'}})

JWTManager(app)

@app.route('/')
def index():
    return "return backend home message"

#using flask JWT extended based on the example provided in docs using JWT tokens.
@app.route('/login', methods = ['GET', 'POST'])
def handle_post():
    if request.method == 'POST': 
        data = request.get_json()
        email = data['email']
        password =  data['password']
        if email == 'stud@nevada.unr.edu' and password == 'secret': #database logic for searching goes here
            token = create_access_token(identity = email)
            return jsonify({'success': True, 'token' :token})
        
        else:
            return jsonify({'success': False})
        
    else: 
        
        return 'returned the backend get message'

#used to test authorized routes, only authenticated users can get this info
@app.route('/protected', methods = ['GET'])   
@jwt_required()
def protected():
    currentUser = get_jwt_identity()
    return jsonify(logged_in_as = currentUser), 200

@app.route('/createUser', methods = ['POST'])   

def createUser():
    data = request.get_json()
    #add user to database code

    return jsonify(created_user = True)

@app.route('/deleteUser', methods = ['DELETE'])   
@jwt_required()
def deleteUser():
    data = request.get_json()
    #remove user to database code

    return jsonify(deleted_user =  True)

@app.route('/data', methods=['GET'])
@jwt_required()
def get_data():
    try:
        records = read_records('lab_sensor_json', "dev_eui = '0025CA0A00015E62'") #hard coded for test
        data = parse_data(records)
        return jsonify(data), 200 #200 shows correct  http responses
    except Exception as e:
        print('error')
        return jsonify({'Error': str(e)}), 500 #500 shows server error


if __name__ == '__main__':
    app.run(debug = True)