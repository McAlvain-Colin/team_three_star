from flask import Flask, request, jsonify, url_for, redirect
from flask_cors import CORS
import datetime
from helperFunctions import * 
from data_parser import *
import models
from flask_mail import Mail, Message

from flask_jwt_extended import (create_access_token, JWTManager, 
                                jwt_required, get_jwt_identity,
                        
                                )

from itsdangerous import URLSafeTimedSerializer, SignatureExpired
# from flask_sqlalchemy import SQLAlchemy




mail = Mail()


app = Flask(__name__)



# db = SQLAlchemy(app)
# app.app_context().push()

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = '@gmail.com' # ALTERED FOR PRIVACY 
app.config['MAIL_PASSWORD'] = ''     # ALTERED FOR PRIVACY 

#added this line to specify where the JWT token is when requests with cookies are recieved
app.config['JWT_SECRET_KEY'] = 'secret' # ALTERED FOR PRIVACY 
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes = 20)
CORS(app) #, supports_credentials=True, resources={r'*' : {'origins' : 'http://localhost:4200'}})

JWTManager(app)

mail.init_app(app)
s = URLSafeTimedSerializer('email secret')


@app.route('/')
def index():
    return "return backend home message"

#using flask JWT extended based on the example provided in docs using JWT tokens.
@app.route('/login', methods = ['POST'])
def login_user():

    data = request.get_json()
    email = data['email']
    password =  data['password']
    if models.checkEmail(email) and password == 'secret': #database logic for searching goes here
        resp = jsonify({'login' : True})
        token = create_access_token(identity = email)
        # set_access_cookies(resp, token)
        return jsonify({'login': True, 'token': token})

    else:
        return jsonify({'success': False})


#used to test authorized routes, only authenticated users can get this info
@app.route('/protected', methods = ['GET'])   
@jwt_required()
def protected():
    currentUser = get_jwt_identity()
    return jsonify({'pro': 'tected'}), 200


@app.route('/createUser', methods = ['PUT'])   
def create_user():

    data = request.get_json()
    email = data['email']
    # password =  data['password']

    emailtoken = s.dumps(email, salt='email-confirm')

    msg = Message('Confirm Email', sender='davidadbdiel775@gmail.com', recipients= [email])

    link = url_for('confirm_email', token = emailtoken, _external = True)

    msg.body = 'email confirmation link {}'.format(link)

    mail.send(msg)
    #add user to database code


    # models.createMember()

    return jsonify({'emailConfirmation': True})

@app.route('/confirm_email/<token>')   
def confirm_email(token):

    try:
        email = s.loads(token, salt='email-confirm', max_age = 3600)
    
        models.createMember(str(email))
        return '<h1>The email confirmation was succesful, please login</h1>'
    except SignatureExpired:
        return '<h1>The email confirmation was unsuccesful, please try again</h1>'




@app.route('/logout', methods = ['DELETE'])   
@jwt_required()
def logout_user():
    # data = request.get_json()
    #remove user to database code

    #jwt token is removed from local storage on frontend

    return jsonify(deleted_user =  True)




@app.route('/deleteUser', methods = ['DELETE'])   
@jwt_required()
def deleteUser():
    data = request.get_json()
    #remove user to database code


    return jsonify(deleted_user =  True)

@app.route('/data', methods=['GET'])
#@jwt_required()
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


#other implementations which can be useful later########################
    
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import datetime

# from flask_jwt_extended import (create_access_token, JWTManager, 
#                                 jwt_required, get_jwt_identity,
#                                 set_access_cookies,
#                                 unset_jwt_cookies,
#                                 get_jwt
#                                 )


# app = Flask(__name__)
# app.config['JWT_COOKIE_SECURE'] = False
# app.config['JWT_COOKIE_LOCATION'] = ['cookies']
# app.config['JWT_SECRET_KEY'] = 'secret'
# app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes = 20)
# CORS(app, supports_credentials=True) #resources={r'*' : {'origins' : 'http://localhost:4200'}})

# JWTManager(app)

# @app.route('/')
# def index():
#     return "return backend home message"

# #using flask JWT extended based on the example provided in docs using JWT tokens.
# @app.route('/login', methods = ['POST'])
# def login_user():

#     data = request.get_json()
#     email = data['email']
#     password =  data['password']
#     if email == 'stud@nevada.unr.edu' and password == 'secret': #database logic for searching goes here
#         resp = jsonify({'login' : True})
#         token = create_access_token(identity = email)
#         set_access_cookies(resp, token)
#         return resp

#     else:
#         return jsonify({'success': False})


# #used to test authorized routes, only authenticated users can get this info
# @app.route('/protected', methods = ['GET'])   
# @jwt_required()
# def protected():
#     currentUser = get_jwt_identity()
#     return jsonify(logged_in_as = currentUser), 200

# @app.route('/createUser', methods = ['POST'])   

# def createUser():
#     data = request.get_json()
#     #add user to database code

#     return jsonify(created_user = True)

# @app.route('/logout', methods = ['DELETE'])   
# @jwt_required()
# def logout_user():
#     data = request.get_json()
#     #remove user to database code

#     return jsonify(deleted_user =  True)




# @app.route('/deleteUser', methods = ['DELETE'])   
# @jwt_required()
# def deleteUser():
#     data = request.get_json()
#     #remove user to database code


#     return jsonify(deleted_user =  True)




# if __name__ == '__main__':
#     app.run(debug = True)


#alternative implementation using cookies
# from flask import Flask, request, jsonify, session
# from flask_cors import CORS
# import datetime



# #from flask_jwt_extended import (create_access_token, JWTManager, 
#  #                               jwt_required, get_jwt_identity)


# app = Flask(__name__)
# app.config['SECRET_KEY'] = 'key'

# #app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes = 30)
# # CORS(app, resources={r'*' : {'origins' : 'http://localhost:4200'}})
# CORS(app, supports_credentials=True)
# # cors = CORS(app, 
# #             resources={r'*' : {'origins' : 'http://localhost:4200'}},
# #             expose_headers= ['Content-Type', 'X-CSRFToken'],
# #             supports_credentials= True)

# #JWTManager(app)

# @app.route('/')
# def index():
#     return "return backend home message"

# #using flask JWT extended based on the example provided in docs using JWT tokens. 
# #Need add validation for data sent from frontend
# @app.route('/login', methods = ['POST'])
# def login_user():
     
#     data = request.get_json()
#     email = data['email']
#     password =  data['password']
#     if email == 'stud@nevada.unr.edu' and password == 'secret': #database logic for searching goes here
#         #token = create_access_token(identity = email)
#         # session.permanent = True
#         session['email'] = email

#         resp = jsonify({'login': True ,'email' : session['email']})

#         # resp.headers.add('Access-Control-Allow-Methods',
#         #                  'GET, POST, OPTIONS, PUT, PATCH, DELETE')
        
#         resp.headers.add('Access-Control-Allow-Headers',"Origin, X-Requested-With, Content-Type, Accept, x-auth")

#         return resp
    
#     else:
#         resp = jsonify({'login': False})

#         resp.headers.add('Access-Control-Allow-Headers',"Origin, X-Requested-With, Content-Type, Accept, x-auth")
#         return resp


# #used to test authorized routes, only authenticated users can get this info
# @app.route('/protected', methods = ['GET'])   
# def protected():
#     # resp = jsonify({'none': 0})
#     print(session)
#     if 'email' in session:
#         resp  = jsonify({'email' :  session['email'], 'lol' : 'we in here'})
#     else:
#         resp = jsonify({'none': 0})

#     resp.headers.add('Access-Control-Allow-Headers',"Origin, X-Requested-With, Content-Type, Accept, x-auth")
#     return resp


# @app.route('/createUser', methods = ['POST'])   

# def createUser():
#     data = request.get_json()
#     #add user to database code

#     return jsonify(created_user = True)

# @app.route('/deleteUser', methods = ['DELETE'])   
# def deleteUser():
#     data = request.get_json()
#     #remove user to database code

#     return jsonify(deleted_user =  True)

# @app.route('/logout', methods = ['DELETE'])   
# def logout_user():
    
#     #remove user session
#     session.pop('email', None)

#     resp = jsonify({'logout' : True})
#     resp.headers.add('Access-Control-Allow-Headers',"Origin, X-Requested-With, Content-Type, Accept, x-auth")

#     return resp



# if __name__ == '__main__':
#     app.run(debug = True)