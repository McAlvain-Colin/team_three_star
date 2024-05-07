import json
from flask import Flask, request, jsonify, url_for, make_response, redirect
from flask_cors import CORS
import datetime
from helperFunctions import * 
from data_parser import *
import models
from stats import *
from datetime import timezone
from flask_mail import Mail, Message

from flask_jwt_extended import (create_access_token, JWTManager, get_jti,
								jwt_required, get_jwt_identity,
								create_refresh_token, get_jwt
								)

from itsdangerous import URLSafeTimedSerializer, SignatureExpired

import bcrypt


from sqlalchemy.sql.functions import now
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, or_, types, Text, LargeBinary, ForeignKey, select, update, exc

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, registry, relationship
from typing_extensions import Annotated
from typing import List


str_320 = Annotated[str, 320]

# NOT USED: BASE class is used to declare a varchar variable with a specific length, based on the sqlalchemy documentation:https://docs.sqlalchemy.org/en/20/orm/declarative_tables.html
class Base(DeclarativeBase):
	registry = registry(type_annotation_map={
		str_320: String(320)

	})
	pass

db = SQLAlchemy(model_class=Base)

###############################
mail = Mail()

# this is for intially creating a Flask application, providing an instance of the Flask class that you can use to build and run your web application. docs:https://flask.palletsprojects.com/en/3.0.x/quickstart/#a-minimal-application
app = Flask(__name__)

# configure the database connection URL for a Flask application that uses the SQLAlchemy library for database operations.docs: https://flask-sqlalchemy.palletsprojects.com/en/3.1.x/quickstart/
#PASSWORD PORTION IN URI WAS ALTERED
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:DBPASSWORD@localhost/postgres' #ALTERED 
db.init_app(app)


# preparing the Flask application to use Flask-Mail to send emails through the specified SMTP server. DOCS: https://pythonhosted.org/Flask-Mail/
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = '@gmail.com' # ALTERED FOR PRIVACY
app.config['MAIL_PASSWORD'] = ''     # ALTERED FOR PRIVACY, FOR ENTERING PASSWORD, REFER TO https://stackoverflow.com/questions/37058567/configure-flask-mail-to-use-gmail

#added this line to specify where the JWT token is when requests with cookies are recieved
app.config['JWT_SECRET_KEY'] = '' # ALTERED FOR PRIVACY
# added tot specify jwt token expiration times
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes = 20)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(hours= 24)
CORS(app, resources={r'/*': {'origins': ['http://localhost:4200', 'http://localhost:5000']}})

# this is for initializating flask jwt extended instance in flask app, refer to docs for more info: https://flask-jwt-extended.readthedocs.io/en/stable/basic_usage.html
jwt = JWTManager(app)

#initilize flasK mail instance with flask app, flask mail doc found in line 55
mail.init_app(app)

# used for creating an instance of the URLSafeTimedSerializer class from the itsdangerous library in Python. This class is used to generate and verify digitally signed data with a time-based signature. docs: https://itsdangerous.palletsprojects.com/en/2.1.x/url_safe/
s = URLSafeTimedSerializer('email-secret') 



# Documentation for creating tables in flask_sqlalchemy: https://flask-sqlalchemy.palletsprojects.com/en/3.1.x/quickstart/#create-the-tables

# Python class Account that represents a database table using the SQLAlchemy Object-Relational Mapping (ORM) library with id, email, password, name, verified, and active define the columns (mapped attributes) of the "Account" table
#note: orgAccounts defines a one-to-many relationship between the Account class and OrgAccount class. This line specifies that an Account instance can have multiple OrgAccount instances associated with it, and the back_populates parameter establishes a bidirectional relationship.
class Account(Base):
	__tablename__ = "Account"

	id:Mapped[int] = mapped_column(primary_key= True) 
	email:Mapped[str] = mapped_column(unique= True)
	password:Mapped[bytes] = mapped_column(types.LargeBinary())
	name: Mapped[str] = mapped_column()
	verified: Mapped[bool] = mapped_column(unique= False)
	active: Mapped[bool] = mapped_column(unique= False)

	orgAccounts: Mapped[List['OrgAccount']] = relationship(back_populates='account')

	def __init__(self, email, password, name, verified, active):
		self.email = email
		self.password = password
		self.name = name
		self.verified = verified
		self.active = active

	def __repr__(self):
		return f'id = {self.id}, email = {self.email}'


# Organization that represents an organization entity in a database with the following columns: id, name, description, and active, orgAccounts defines a one-to-many relationship between the Organization class and OrgAccount class. 
# This line specifies that an Organization instance can have multiple OrgAccount instances associated with it, and the back_populates parameter establishes a bidirectional relationship. Similarly, OrgApps defines a one-to-many relationship between the Organization class and OrgApplication class. This line specifies that an Organization instance can have multiple OrgApplication instances associated with it, and the back_populates parameter establishes a bidirectional relationship.
class Organization(Base):
	__tablename__ = "Organization"

	id:Mapped[int] = mapped_column(primary_key= True) 
	name: Mapped[str] = mapped_column(nullable= False, unique= True)
	description:Mapped[str] = mapped_column(nullable= True)
	active: Mapped[bool] = mapped_column(unique= False)

	orgAccounts: Mapped[List['OrgAccount']] = relationship(back_populates='org')

	orgApps: Mapped[List['OrgApplication']] = relationship(back_populates='org')


	def __init__(self, name, description, active):
		self.name = name
		self.description = description
		self.active = active

	def __repr__(self):
		return f'organization: {self.name}'
#################################################################
# THE FOLLOWING INTEGER VALUES WERE USED TO IDENTIFY USER ROLES
# 1- admin, 2- PI, 3 - basic user.
###################################################################


# Orgaccount represents the mapping between organizations and user accounts in a database with the following columns: id, a_id, o_id, r_id, org represents a one-to-many relationship between the OrgAccount class and the Organization class. Each OrgAccount instance is associated with one Organization instance, and an Organization instance can have multiple OrgAccount instances associated with it. The back_populates parameter establishes a bidirectional relationship. 
# account represents a one-to-many relationship between the OrgAccount class and the Account class. Each OrgAccount instance is associated with one Account instance, and an Account instance can have multiple OrgAccount instances associated with it. The back_populates parameter establishes a bidirectional relationship.
class OrgAccount(Base):
	__tablename__ = 'OrgAccount'

	id:Mapped[int] = mapped_column(primary_key= True) 

	a_id: Mapped[int] = mapped_column(ForeignKey('Account.id'))
	account: Mapped['Account'] = relationship(back_populates='orgAccounts')

	o_id: Mapped[int] = mapped_column(ForeignKey('Organization.id'))
	org: Mapped['Organization'] = relationship(back_populates='orgAccounts')

	#added line/column for roles
	r_id:Mapped[int] = mapped_column()
	active: Mapped[bool] = mapped_column()


# Application represents an application entity in a database with columns id, name, description, orgs and appSensors. Orgs efines a one-to-many relationship between the Application class and another class called OrgApplication. This line specifies that an Application instance can have multiple OrgApplication instances associated with it, and the back_populates parameter establishes a bidirectional relationship. 
# Also, appSensors defines a one-to-many relationship between the Application class and another class called AppSensors. This line specifies that an Application instance can have multiple AppSensors instances associated with it, and the back_populates parameter establishes a bidirectional relationship.
class Application(Base):
	__tablename__ = 'Application'

	id: Mapped[int] = mapped_column(primary_key= True)
	name : Mapped[str] = mapped_column(nullable= False)
	description: Mapped[str] = mapped_column(nullable= True)

	orgs: Mapped[List['OrgApplication']] = relationship(back_populates='app')

	appSensors: Mapped[List['AppSensors']] = relationship(back_populates='app')

	def __repr__(self):
		f'app: {self.id}, {self.name}'

# OrgApplication represents a mapping between organizations and applications in a database with columns id, app_id, o_id, and active columns. app represents a many-to-one relationship between the OrgApplication class and the Application class. Each OrgApplication instance is associated with one Application instance, and an Application instance can have multiple OrgApplication instances associated with it. The back_populates parameter establishes a bidirectional relationship.
# Also, org represents a many-to-one relationship between the OrgApplication class and the Organization class. Each OrgApplication instance is associated with one Organization instance, and an Organization instance can have multiple OrgApplication instances associated with it. The back_populates parameter establishes a bidirectional relationship.
class OrgApplication(Base):
	__tablename__ = 'OrgApplication'

	id: Mapped [int] = mapped_column(primary_key = True)
	# appSensors: Mapped[List['AppSensors']] = relationship(back_populates='orgApp')

	#apps
	app_id: Mapped[int] = mapped_column(ForeignKey('Application.id'))
	app: Mapped['Application'] = relationship(back_populates= 'orgs')

	o_id: Mapped[int] = mapped_column(ForeignKey('Organization.id'))
	org: Mapped['Organization'] = relationship(back_populates='orgApps')

	active: Mapped[bool] = mapped_column(unique=False)


	# dev_eui: Mapped[str] = mapped_column(ForeignKey('Devices.dev_eui'))
	# device: Mapped['Device'] = mapped_column(back_populates= 'appDevice')
	def __repr__(self):
		return f'orgApp: {self.id} {self.app_id} {self.o_id}'


# Appsensors represents a mapping between applications and sensors/devices in a database with columns app_id, dev_name, dev_eui. app represents a many-to-one relationship between the AppSensors class and the Application class. Each AppSensors instance is associated with one Application instance, and an Application instance can have multiple AppSensors instances associated with it. 
# The back_populates parameter establishes a bidirectional relationship. There is a constraint that the nickname/human readable name given to a device has to be unique regardless of app the device-eui is in. 
class AppSensors(Base):
	__tablename__ = 'AppSensors'

	app_id: Mapped[int] = mapped_column(ForeignKey('Application.id'))
	app: Mapped['Application'] = relationship(back_populates= 'appSensors')

	# dev_eui needs to have the table name as stored in postgreSQL
	dev_name: Mapped[str] = mapped_column(String, nullable= False, unique= True)
	dev_eui: Mapped[str] = mapped_column(Text, primary_key= True)

# Using the JWT FLASK EXTENDED extension with sqlalchemy, TokenBlockList represents a table for storing information about revoked or blocked JSON Web Tokens (JWTs) in the flask app. The table has columns: id, jti(unique identifier for a JWT), type (type of the JWT e.g., "access_token", "refresh_token"), user_id for the user who has access to the token, created_at is a datetime column named created_at that cannot be null and is set to the current time by default using the now() server function, 
# valid indicates whether the JWT is still valid or has been revoked/blocked. 
class TokenBlockList(Base):
	__tablename__ = 'TokenBlockList'
	id: Mapped[int] = mapped_column(primary_key=True)
	jti: Mapped[str] = mapped_column(nullable=False, index=True)
	type: Mapped[str] = mapped_column(nullable=False)
	user_id: Mapped[int] = mapped_column(nullable=False)
	created_at: Mapped[datetime.datetime] = mapped_column(server_default= now(), nullable=False)
	valid: Mapped[bool] = mapped_column(nullable= False)


# SQLAlchemy model class called Device that maps to an existing database table: lab_sensor_json. with app.app_context(): creates an application context for the Flask application. This is necessary in order to work with Flask extensions like SQLAlchemy within the current script.
# db.reflect() is a method provided by SQLAlchemy that reflects the existing database tables and their structure into Python objects. This allows you to create models based on the existing database schema instead of creating the schema from Python models. DOCS: https://flask-sqlalchemy.palletsprojects.com/en/3.1.x/models/#reflecting-tables
# class Device(Base): defines a new SQLAlchemy model class called Device that inherits from the Base class, which is likely a base class provided by SQLAlchemy for defining database models.
# __tablename__ = db.metadata.tables['lab_sensor_json'] specifies the name of the database table that this class represents. Instead of using a string literal, it retrieves the table object for the lab_sensor_json table from the database metadata. This allows the code to map the Device class to an existing table in the database.DOCS:https://docs.sqlalchemy.org/en/20/core/metadata.html
with app.app_context():
# for creating db with present db tables
	db.reflect()

# this table represent the lab sensor json provided by Zach
class Device(Base):
    __tablename__ = db.metadata.tables['lab_sensor_json']
	
    dev_eui: Mapped[str] = mapped_column(Text, primary_key= True) 





# check_if_token_revoked is a callback for the Flask-JWT-Extended extension. This function is responsible for checking if a given JSON Web Token (JWT) has been revoked or blocked. iT retrieves the JWT ID (jti) from the JWT payload and returns the first result of the query, which is expected to be a boolean value indicating whether the token is valid or not.  
# BASED ON JWT FLASK EXTENDED EXAMPLE: https://flask-jwt-extended.readthedocs.io/en/stable/blocklist_and_token_revoking.html#databas
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
	jti = jwt_payload['jti']
	token_valid = db.session.execute(db.select(TokenBlockList.valid).where(TokenBlockList.jti == jti)).scalar()
	# print(token_valid)
	return not token_valid


# refresh route is responsible for creating a new access token for a user in a JSON Web Token (JWT) based authentication system using the Flask-JWT-Extended extension. it accepts HTTP POST requests, uses a a decorator that requires a valid refresh token to access this route, uses the user identity (typically the user ID) from the refresh token's payload using the get_jwt_identity() function provided by Flask-JWT-Extended,  creates a new access token for the user using the create_access_token() function from Flask-JWT-Extended, 
# passing the user identity as an argument, creates a new row in the TokenBlockList table with the JWT ID (jti), token type (ttype), user ID (identity), creation time (now), and a valid flag set to True, commits this to the TokenBlockList table and returns a JSON response containing the new access token with an HTTP status code of 200 (OK).
@app.route('/refresh', methods = ['POST'])
@jwt_required(refresh = True)
def refresh():

	# print('inside of the refresh tokemn func ')
	identity = get_jwt_identity()

	token = create_access_token(identity = identity)

	# add the new JWT access token to the db
	jti = get_jti(token)
	ttype = 'access'
	now = datetime.datetime.now(timezone.utc)# updated 
	db.session.add(TokenBlockList(jti= jti, type= ttype, user_id = identity, created_at = now, valid = True))
	db.session.commit()

	return jsonify({'token': token}), 200


# handles user login and generates access and refresh tokens using the Flask-JWT-Extended extension. The route /login that accepts HTTP POST requests, retrieves the JSON data from the request body, gets the email and password from the request data, then queries the Account table to find a user with the provided email and a verified account status. The scalar() method returns the first result of the query, if no user was found with the provided email. 
# If so, it returns a JSON response with {'login': False} and an HTTP status code of 401 (Unauthorized). The route checks if the provided password matches the user's hashed password stored in the database using the bcrypt library.If the password is correct, it proceeds to generate and store access and refresh tokens, as well as add new rows to the TokenBlockList table with the JWT ID, token type, user ID, creation time, and a valid flag set to True for both the access and refresh tokens, 
# and creates a JSON response containing a 'login' status, the access token ('token'), and the refresh token ('refreshToken') returning the JSON response with an HTTP status code of 200 (OK). If the password is incorrect, it returns a JSON response with {'login': False} and an HTTP status code of 401 (Unauthorized).
#This route is using flask JWT extended based on the example provided in docs using JWT tokens. DOCS: https://flask-jwt-extended.readthedocs.io/en/stable/basic_usage.html
@app.route('/login', methods = ['POST'])
def login_user():

	data = request.get_json()
	email = data['email']
	password =  data['password']

	
	user = db.session.execute(db.select(Account).where(Account.email == email).where(Account.verified == True)).scalar()
	if(user == None):
		return jsonify({'login': False}), 401

	if bcrypt.checkpw(password.encode('utf-8'), user.password): #database logic for searching goes here
	
		token = create_access_token(identity = user.id)
		refreshToken = create_refresh_token(identity = user.id)


		# add the JWT access token in the jwt block list
		jti = get_jti(token)
		ttype = 'access'
		now = datetime.datetime.now(timezone.utc)# updated 
		db.session.add(TokenBlockList(jti= jti, type= ttype, user_id = user.id, created_at = now, valid = True))
		db.session.commit()

		# add the JWT refresh token in the jwt block list
		jti = get_jti(refreshToken)
		ttype = 'refresh'
		now = datetime.datetime.now(timezone.utc)# updated 
		db.session.add(TokenBlockList(jti= jti, type= ttype, user_id = user.id, created_at = now, valid = True))
		db.session.commit()


		response = jsonify({'login': True, 'token': token, 'refreshToken': refreshToken})
		return response, 200
	else:

		return jsonify({'login': False}), 401



#used to test authorized routes, only authenticated users can get this info, USED FRO TESTING IF ROUTE RETURN IS SUCCESSFUL
@app.route('/protected', methods = ['GET'])  
@jwt_required()
def protected():
	# currentUser = get_jwt_identity()
	page = db.paginate(db.select(Account))
	j = [{'id': r.id,
		'email': r.email
			} for r in page.items
		]
	return jsonify(j), 200


# create_user route handles the creation of a new user account. It also sends an email confirmation link to the user's email address using the Flask-Mail extension. This route accepts HTTP PUT requests. The route retrieves the JSON data from the request body gets the email, password, and name from the request data. Also queries the Account table to check if a user with the provided email already exists and has a verified account status. 
# Then checks if a user with the provided email already exists. If so, it returns a JSON response with 'The email is already registered' and conflicted HTTP code. If no user with the provided email exists, it proceeds to send an email confirmation link, then creates a signed token containing the user's email, password, and name using the URLSafeTimedSerializer (s) from the itsdangerous library. as well as creates a new email message object using the Flask-Mail extension, with the subject "Confirm Email", 
# the sender email address user specifies, then  generates a URL for the confirm_email route, passing the generated emailtoken as a parameter. The _external=True parameter ensures that the generated URL includes the hostname and protocol returns a JSON response with {'emailConfirmation': True}, indicating that the email confirmation link has been sent successfully.
@app.route('/createUser', methods = ['PUT'])  
def create_user():

	data = request.get_json()
	email = data['email']
	password =  data['password']
	name = data['name']

	user = db.session.execute(db.select(Account).where(Account.email == email).where(Account.verified == True)).scalar()
	if(user != None):
		return jsonify({'errorMessage': 'The email is already registered'}), 409 
	else:
		try:


			emailtoken = s.dumps(email + "|" + password + "|" + name, salt='email-confirm')

			


			msg = Message('Confirm Email', sender='ENTER-YOUR-EMAIL@gmail.com', recipients= [email])

			link = url_for('confirm_email', token = emailtoken, _external = True)

			msg.body = 'email confirmation link {}'.format(link)

			mail.send(msg)

			return jsonify({'emailConfirmation': True})
		except exc.SQLAlchemyError:
			return jsonify({'errorMessage': "couldn't create a account" }), 409 


# confirm_email route decorates a function to handle requests to the specified route, which includes a placeholder token, this token value is passed in the URL. Using the token as an argument. The code attempts to decode and verify the token using a loads function from the s object. It also specifies a salt value for the decoding process and sets a maximum age for the token. 
# If successful, creates a new Account object with the extracted information, sets some flags for the account, adds it to the database session, and commits the changes to the database. if it catches the exception and redirects the user to a login page with a specified message appended to the URL back to login with a false value.
@app.route('/confirm_email/<token>')  
def confirm_email(token):

	try:

		userInfo = s.loads(token, salt='email-confirm', max_age = 360)
		userInfo = userInfo.split("|")
		email = userInfo[0]
		password = userInfo[1]
		name = userInfo[2]

		hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

		newUser = Account(email, hashed, name,  True, True)
		db.session.add(newUser)
		db.session.commit()

		return redirect("http://localhost:4200/login/true", code=302)

	except SignatureExpired or exc.SQLAlchemyError:
		return redirect("http://localhost:4200/login/false", code=302)

# This function accepts an email and sends out the request to reset the password to the provided email>
@app.route('/resetRequest', methods = ['PUT'])  
def resetRequest():
	data = request.get_json()
	email = data['email']

	emailtoken = s.dumps(email, salt='reset-request')

	msg = Message('CSSI Portal Password Reset', sender='cssiportalconfirmation@gmail.com', recipients= [email])

	link = url_for('reset_email', token = emailtoken, _external = True)

	msg.body = "You've requested to reset the your password! \nClick the link below to start the process for setting a new password. \nIf you didn't request this procedure, feel free to disregard this message.\n"
	msg.body = msg.body + 'Reset Password Link: {}'.format(link)

	mail.send(msg)

	return jsonify(emailSent = True)

# The reset_email function will hash the email and then send off the code into the reroute based on if the email was clicked on time.
@app.route('/reset_email/<token>')  
def reset_email(token):

	try:
		email = s.loads(token, salt='reset-request', max_age = 360)

		resetToken = s.dumps(email, salt='reset-password')
		
		return redirect("http://localhost:4200/reset-password/" + resetToken, code=302)
	except SignatureExpired:
		return redirect("http://localhost:4200/login/false" , code=302)

# If this function is called, the password of the user with the specified email will be reset based on the newly provided password.
@app.route('/resetPassword', methods = ['PUT'])
def resetPassword():
	try:
		data = request.get_json()
		token = data['token']
		newPassword = data['password']
		email = s.loads(token, salt='reset-password', max_age = 720)

		newHashed = bcrypt.hashpw(newPassword.encode('utf-8'), bcrypt.gensalt())

		ACCOUNTS = db.metadata.tables[Account.__tablename__]

		updatePassword = update(ACCOUNTS).values(password = newHashed).where(ACCOUNTS.c.email == email)
		db.session.execute(updatePassword)
		db.session.commit()

		return jsonify(resetPasswordSuccess = True)
	except SignatureExpired:
		return redirect("http://localhost:4200/login/false", code=302)



# logout route will handle DELETE requests. The function with a decorator from the Flask-JWT-Extended extension, indicating that JWT (JSON Web Token) authentication is required for this route, but the type of verification is not strict (verify_type=False). 
# The route retrieves the identity (user ID or another unique identifier) from the JWT token in the request header, then it queries the database to retrieve all tokens associated with the user identified by 'identity' where the tokens are valid in the TokenBlocklist table, then marking the tokens as invalid in the db, then returning ok HTTP code.
@app.route('/logout', methods = ['DELETE'])  
@jwt_required(verify_type= False)
def logout_user():

	identity = get_jwt_identity()
	# remove all tokens that user generated in the session 
	tokenList = db.session.execute(db.select(TokenBlockList).where(TokenBlockList.user_id == identity).where(TokenBlockList.valid == True)).scalars()

	for token in tokenList.all():
		token.valid = False

	db.session.commit()

	response = jsonify({'logout': True})

	return response, 200

# createOrg route will handle POST requests, it requiring JWT authentication to access this route from the JWT flask extended extension. The route retrieves JSON data from the request body. If such an organization exists, it updates the organization and organization account tables to mark them as active and associates the organization with the user, 
# then returns a JSON response with message indicating organization was created (orgCreated = True). If the org is not in db, the code proceeds to create a new organization (newOrg) and a corresponding organization account (orgAcc) linking the user with the organization in the database, returning error if not successful.
@app.route('/createOrg', methods = ['POST'])  
@jwt_required()
def createOrganization():

	data = request.get_json() #uid, org titel, org descritpion
	userId = get_jwt_identity()
	orgName = data['orgName']
	descript = data['orgDescript']

	#Check for Org name in org id Table, and then get id, and then set the id's where user id and org id match active to true
	ORGS = db.metadata.tables[Organization.__tablename__]
	ORGACCOUNTS = db.metadata.tables[OrgAccount.__tablename__]

	checkOrg = select(ORGS).where(
		ORGS.c.name == orgName,
		ORGS.c.active == False
	)
	theOrg = db.session.execute(checkOrg).first()

	if theOrg:
		updateOrg = update(ORGS).values(active = True).where(ORGS.c.id == theOrg.id)
		updateOrgAccount = update(ORGACCOUNTS).values(active = True).where(ORGACCOUNTS.c.o_id == theOrg.id).where(ORGACCOUNTS.c.a_id == userId)
		db.session.execute(updateOrg)
		db.session.commit()
		db.session.execute(updateOrgAccount)
		db.session.commit()
		return jsonify(orgCreated = True)

	#database code
	try:
		if ( db.session.execute(db.select(Organization.name).where(Organization.name == orgName).where(Organization.active == True)).scalar() is not None):
			return jsonify({'errorMessage': 'A organization with this organization title is already present'}), 409
		


		newOrg = Organization(name= orgName, description= descript, active= True)
		user = db.session.execute(db.select(Account).filter_by(id = userId)).scalar()


		#link the account with the org
		orgAcc = OrgAccount(account= user, org= newOrg, r_id = 1, active = True)

		db.session.add(newOrg)
		db.session.commit()
		db.session.add(orgAcc)
		db.session.commit()
		return jsonify(orgCreated = True)

	except exc.SQLAlchemyError:
		
		return jsonify(orgCreated = False)

#inviteUser hashes the users information and makes the relation in the database if and only if the user exists< and has no relation to the organization. 
@app.route('/inviteUser',  methods = ['PUT'])
def inviteUser():
	data = request.get_json()
	email = data['email']
	orgId = data['orgId']
	orgName = data['orgName']

	emailtoken = s.dumps(email + "|" + orgId , salt='email-invite')

	msg = Message("Organization Invite CSSI Web Portal", sender='cssiportalconfirmation@gmail.com', recipients= [email])

	link = url_for('invite_email', token = emailtoken, _external = True)

	msg.body = "You've been invited to join an organization! \n Would you like to join " + orgName + "?\n"
	msg.body = msg.body + 'Join org link: {}'.format(link)

	ORGACCOUNTS = db.metadata.tables[OrgAccount.__tablename__]

	joinUser = db.session.execute(db.select(Account).filter_by(email = email)).scalar()
	if joinUser is None:
		return jsonify(inviteSent = False)
	else:
		checkOrgAccount = select(ORGACCOUNTS).where(
		ORGACCOUNTS.c.o_id == orgId,
		ORGACCOUNTS.c.a_id == joinUser.id,
		ORGACCOUNTS.c.active == False
		)
		checkMembership = select(ORGACCOUNTS).where(
		ORGACCOUNTS.c.o_id == orgId,
		ORGACCOUNTS.c.a_id == joinUser.id,
		ORGACCOUNTS.c.active == True
		)

		if db.session.query(checkMembership.exists()).scalar():
			return jsonify(userExists = True)
		elif db.session.query(checkOrgAccount.exists()).scalar():
			pass #Pass the creation function if it already exists but is a non-active member
		else:
			orgacc = OrgAccount(a_id= joinUser.id, o_id= orgId)
			orgacc.r_id = 3
			orgacc.active = False

			db.session.add(orgacc)
			db.session.commit()
			
		mail.send(msg)
		return jsonify(inviteSent = True)

# The invite email will set the user"s account status if they exist to be a member of the organization through a relation.
@app.route('/invite_email/<token>')  
def invite_email(token):

	try:
		infoLoaded = s.loads(token, salt='email-invite', max_age = 360)
		infoLoaded = infoLoaded.split("|")
		email = infoLoaded[0]
		orgId = infoLoaded[1]

		ORGACCOUNTS = db.metadata.tables[OrgAccount.__tablename__]

		joinUser = db.session.execute(db.select(Account).filter_by(email = email)).scalar()
		if joinUser is None:
			return "<h1>User doesn't have an acccount!<h1>"

		userActivate = update(ORGACCOUNTS).values(active = True).where(ORGACCOUNTS.c.a_id == joinUser.id).where(ORGACCOUNTS.c.o_id == orgId)
		db.session.execute(userActivate)
		db.session.commit()

		return redirect("http://localhost:4200/login/true", code=302)
	except SignatureExpired:
		return redirect("http://localhost:4200/login/false", code=302)

# The deleteOrg function will get a user"s id and then check their relation to the Organization altering their view of it if they aren"t admins.
# If the user is an admin< then the organization itself is set to inactive which won"t show up in anyone'S list at all.
@app.route('/deleteOrg', methods = ['PUT'])
@jwt_required()
def deleteOrg():
	data = request.get_json()
	orgId = data['orgId']
	userId = get_jwt_identity()
	ORGS = db.metadata.tables[Organization.__tablename__]
	ORGACCOUNTS = db.metadata.tables[OrgAccount.__tablename__]
	
	removeOrg = update(ORGS).values(active = False).where(ORGS.c.id == orgId)
	checkAdminAccount = select(ORGACCOUNTS).where(
	ORGACCOUNTS.c.a_id == userId,
	ORGACCOUNTS.c.o_id == orgId,
	ORGACCOUNTS.c.r_id == 1
	)
	checkOrgAccount = select(ORGACCOUNTS).where(
		ORGACCOUNTS.c.a_id == userId,
		ORGACCOUNTS.c.o_id == orgId
	)
	removeAccount = update(ORGACCOUNTS).values(active = False).where(
		ORGACCOUNTS.c.a_id == userId,
		ORGACCOUNTS.c.o_id == orgId
	)

	if db.session.query(checkAdminAccount.exists()).scalar():
		# Execute the update for ORGS
		db.session.execute(removeAccount)
		db.session.commit()
		db.session.execute(removeOrg)
		db.session.commit()
		return jsonify(orgDeleteSuccess = True)
	else:
		if db.session.query(checkOrgAccount.exists()).scalar():
			db.session.execute(removeAccount)
			db.session.commit()
			return jsonify(orgDeleteSuccess = True)
		else:
			return jsonify(orgDeleteSuccess = False)


# userOrg route will handle GET requests, requiring JWT authentication to access this route. retrieves the 'org' parameter from the URL query string, which contains the ID of the organization the user wants to get info from. Then attempts to convert the retrieved 'orgId' to an integer (int(orgId)) and queries the database to fetch the organization details (name and description) based on the provided ID, 
# a JSON response (res) containing the organization's name and description is returned with an HTTP status code 200 (OK). If  error occurs during the database query or if the 'orgId' cannot be converted to an integer (ValueError), it returns a JSON response with an error message and an HTTP status code 404 (Not Found).
@app.route('/userOrg', methods = ['GET']) 
@jwt_required() 
def getOrg():
	
	orgId = request.args['org']

	try:
		orgId  = int(orgId)

		page = db.session.execute(db.select(Organization).where(Organization.id == orgId)).scalar()
		res  = {
			'name': page.name,
			'description': page.description
		} 
		return jsonify(res), 200

	except exc.SQLAlchemyError or ValueError:
		return jsonify({'error': "couldn't get your org with name specified"}), 404




# orgMembers route will handle GET requests requiring JWT authentication to access this route. the route retrieves the 'org' parameter from the URL query string, which is expected to contain the ID of the organization,  
# then attempts to convert the retrieved 'orgId' to an integer, then query selects specific columns  from the 'Account' table, joining it with the 'OrgAccount' table based on matching organization ID. The query also applies filters to only select active organization members, then formatted into a JSON response, returning ok HTTP code if sucessful, otherwise 404. 		
@app.route('/OrgMembers', methods = ['GET']) 
@jwt_required() 
def getOrgMembers():

	orgId = request.args['org']


	try:
		orgId = int(orgId)

		users = select(Account.id, Account.name, Account.email, OrgAccount.r_id).join(OrgAccount).where(OrgAccount.o_id == orgId).where(OrgAccount.active == True).where(Account.verified  == True).where(Account.active == True)

		page = db.session.execute(users).all()

		res = {
			'list': [
				{
				'a_id' : p.id,
				'name': p.name,
				'r_id' : p.r_id,
				'email' : p.email
				} for p in page
			]
		}
		return jsonify(res), 200
	
	except exc.SQLAlchemyError or ValueError:
		return jsonify({'error': "couldn't get your org members"}), 404

# DeleteMember will remove the member from the organization by setting their active status to false.
@app.route('/deleteMember', methods = ['PUT'])
@jwt_required()
def deleteMember():
	data = request.get_json()
	orgId = data['orgId']
	memberId = data['memberId']
	ORGACCOUNTS = db.metadata.tables[OrgAccount.__tablename__]
	
	removeMember = update(ORGACCOUNTS).values(active = False).where(
		ORGACCOUNTS.c.a_id == memberId,
		ORGACCOUNTS.c.o_id == orgId
	)

	db.session.execute(removeMember)
	db.session.commit()
	return jsonify(memberDeleteSuccess = True)

# ChangeMemberRole will alter the given member's role based on the provided role number in the OrgAccount table.
@app.route('/changeMemberRole', methods = ['PUT'])
@jwt_required()
def changeMemberRole():
	data = request.get_json()
	orgId = data['orgId']
	memberId = data['memberId']
	roleId = data['roleId']
	ORGACCOUNTS = db.metadata.tables[OrgAccount.__tablename__]
	
	changeRoleMember = update(ORGACCOUNTS).values(r_id = roleId).where(
		ORGACCOUNTS.c.a_id == memberId,
		ORGACCOUNTS.c.o_id == orgId
	)

	db.session.execute(changeRoleMember)
	db.session.commit()
	return jsonify(roleChangeSuccess = True)


# userOwnedOrgList will handle GET requests, requiring JWT authentication to access this route, The route will retrieves the user ID (identity) from the JWT token in the request header. Then the route will query to fetch organizations owned by the user. 
# It joins the 'Organization' table with the 'OrgAccount' table based on matching user id, where the user has a specific role ID-1 admin. etched organization data is formatted into a JSON response, returning HTTP status code 200 (OK), If any SQLAlchemy error occurs during the database query, 
# it returns a JSON response with an error message and an HTTP status code 404
@app.route('/userOwnedOrgList', methods = ['GET']) 
@jwt_required() 
def getOwnedOrgList():

	uid = get_jwt_identity()


	try:
		page = db.session.execute(db.select(Organization).join(Organization.orgAccounts).where(OrgAccount.a_id == uid).where(OrgAccount.r_id == 1).where(OrgAccount.active == True)).scalars()

		res = {
		'list': [
				{
					'o_id' : p.id,
					'name': p.name,
					'description': p.description,
					'num_apps': db.session.query(OrgApplication).where(OrgApplication.o_id == p.id, OrgApplication.active == True).count(),
					'total_members': db.session.query(OrgAccount).where(OrgAccount.o_id == p.id, OrgAccount.active == True).count()
				} for p in page.all()
			]
		}
		return jsonify(res), 200
	
	except exc.SQLAlchemyError:

		return jsonify({'errorMessage': "Couldn't get your owned organizations"}), 404
	
	
# userJoinedOrgList will handle GET requests requiring JWT authentication to access this route. The route will retrieve the user ID (identity) from the JWT token in the request header. Then the route will  query to fetch organizations that the user has joined. It joins the 'Organization' table with the 'OrgAccount' table based on matching user ID the query filters the results to include organizations where the user has role IDs 2 or 3 or user who have less permissions in the app. 
# The fetched organization data is formatted into a JSON response with an organization with its ID, name, description, the number of active applications associated with it, returning  HTTP status code 200 (OK) if successful, otherwise if any SQLAlchemy error occurs during the database query, it returns a JSON response with an error message and an HTTP status code 404
@app.route('/userJoinedOrgList', methods = ['GET']) 
@jwt_required() 
def getJoinedOrgList():

	uid = get_jwt_identity()

	try:
		page = db.session.execute(db.select(Organization).join(Organization.orgAccounts).where(OrgAccount.a_id == uid).where((OrgAccount.r_id == 2) | (OrgAccount.r_id == 3)).where(OrgAccount.active == True)).scalars()

		res = {
		'list': [
				{
					'o_id' : p.id,
					'name': p.name,
					'description': p.description,
					'num_apps': db.session.query(OrgApplication).where(OrgApplication.o_id == p.id, OrgApplication.active == True).count(),
					'total_members': db.session.query(OrgAccount).where(OrgAccount.o_id == p.id, OrgAccount.active == True).count()
				} for p in page.all()
			]
		}
		print(res)
		return jsonify(res), 200
	
	except exc.SQLAlchemyError:

		return jsonify({'errorMessage': "Couldn't get your Joined Organizations"}), 404


# getOrgInfo will handle GET requests, requiring JWT authentication to access this route. The route.will retrieve the user ID (identity) from the JWT token in the request header. The route retrieves the 'org' parameter from the URL query string, which is expected to contain the ID of the organization. queries to fetch information about the organization and the user's role in that organization. 
# It joins the 'Organization' table with the 'OrgAccount' table based on matching user and org ids, then fetched organization and user information is formatted into a JSON response with ok HTTP response code. If any SQLAlchemy error occurs during the database query, the function catches the exception and returns a JSON response with an error message and an HTTP status code 404.
@app.route('/getOrgInfo', methods = ['GET'])
@jwt_required()
def getOrgInfo():
	uid = get_jwt_identity()
	orgId = request.args['org']

	try:
		userOrg = db.session.execute(db.select(Organization).join(Organization.orgAccounts).where(OrgAccount.a_id == uid).where(OrgAccount.o_id == orgId)).scalar()
		userId = db.session.execute(db.select(OrgAccount).where(OrgAccount.a_id == uid).where(OrgAccount.o_id == orgId)).scalar()

		res = {
		'list': [
				{
					'o_id' : orgId,
					'name': userOrg.name,
					'description': userOrg.description,
					'r_id': userId.r_id
				}
			]
		}
		res = json.dumps(res)
		return make_response(res, 200)
	
	except exc.SQLAlchemyError:

		return jsonify({'errorMessage': "Couldn't get your Org info"}), 404


# createOrgApp will handle POST requests, requiring JWT authentication to access this route. the route will retrieves JSON data from the request body, if an application with the same name already exists in the database, which is checked with a query, mark the application as active and links it with the organization, returning a JSON response for successful application creation. 
# If the application does not already exist or is already active, the code proceeds to create a new application, inking it with the specified organization, return sucess with a ok HTTP code. If any SQLAlchemy error or failing  in casting http query parameter into integer during this process, it returns a JSON response with an error message, with 404 HTTP code error.
@app.route('/createOrgApp', methods = ['POST'])  
@jwt_required()
def createOrgApplication():

	data = request.get_json()
	orgId = data['orgId']
	appName = data['appName']
	appDescript = data['appDescript']

	APPS = db.metadata.tables[Application.__tablename__]
	ORGAPPS = db.metadata.tables[OrgApplication.__tablename__]

	getApp = select(APPS).where(
		APPS.c.name == appName,
	)
	theApp = db.session.execute(getApp).first()

	if theApp:
		checkOrgApp = select(ORGAPPS).where(
			ORGAPPS.c.app_id == theApp.id,
			ORGAPPS.c.active == False
		)

		theOrgApp = db.session.execute(checkOrgApp).first()

		if theOrgApp:
			updateOrgApp = update(ORGAPPS).values(active = True).where(ORGAPPS.c.app_id == theApp.id).where(ORGAPPS.c.o_id == orgId)
			db.session.execute(updateOrgApp)
			db.session.commit()
			return jsonify(orgCreated = True)

	#link the app with the org
	try:
		if ( db.session.execute(db.select(Application.name).join(Application.orgs).where(Application.name == appName).where(OrgApplication.active == True)).scalar() is not None):
			return jsonify({'errorMessage': 'A application with this application name is already present'}), 409
		

		orgId = int(orgId)
		newApp= Application(name= appName, description= appDescript)
		org = db.session.execute(db.select(Organization).where(Organization.id == orgId)).scalar()


		orgApp = OrgApplication(app= newApp, org= org, active=True)

		db.session.add(newApp)
		db.session.commit()
		db.session.add(orgApp)
		db.session.commit()

		return jsonify(orgCreated = True), 200

	except exc.SQLAlchemyError or ValueError:

		return jsonify({'errorMessage': "Couldn't add your application"}), 404

# The deleteOrgApp will set the active status of an application with its organization to false which removes it from the organization's view
@app.route('/deleteOrgApp', methods = ['PUT'])
@jwt_required()
def deleteOrgApp():
	data = request.get_json()
	orgId = data['orgId']
	appId = data['appId']
	ORGAPPS = db.metadata.tables[OrgApplication.__tablename__]
	
	removeApp = update(ORGAPPS).values(active = False).where(
		ORGAPPS.c.app_id == appId,
		ORGAPPS.c.o_id == orgId
	)

	db.session.execute(removeApp)
	db.session.commit()
	return jsonify(appDeleteSuccess = True)



# userOrgApp will handle GET requests, requiring JWT authentication to access this route. The route retrieves the 'app' parameter from the URL query string, which is expected to contain the ID of the organization application, attempts to convert the retrieved 'app_id' to an integer,
#  The fetched organization application information is formatted into a JSON response is returned with an HTTP status code 200 (OK). If any SQLAlchemy error occurs during the database query or if the 'app_id' cannot be converted to an integer (ValueError), it returns a JSON response with an error message and an HTTP status code 404
@app.route('/userOrgApp', methods = ['GET']) 
@jwt_required() 
def getOrgApp():

	app_id = request.args['app']


	try:

		app_id = int(app_id)

		app = db.session.execute(db.select(Application).where(Application.id == app_id)).scalar()
		res = {
				'app_id': app.id,
				'name': app.name,
				'description': app.description
		}
		return jsonify(res), 200
	
	except exc.SQLAlchemyError or ValueError:

		return jsonify({'errorMessage': "Couldn't get your organization"}), 404
	


# userOrgAppList will  handle GET requests requiring JWT authentication to access this route. The route will retrieves the user ID (identity) from the JWT token in the request header, retrieves the 'org' parameter from the URL query string, which is expected to contain the ID of the organization, attempts to convert the retrieved 'oid' to an integer, query to fetch information about the organization applications associated with the specified org ID, 
# The query  fetched organization application information is formatted into a JSON response, returned with ok HTTP code if successful, If any SQLAlchemy error occurs during the database query or if the 'oid' cannot be converted to an integer (ValueError), it returns a JSON response with an error message and an HTTP status code 404
@app.route('/userOrgAppList', methods = ['GET']) 
@jwt_required() 
def getOrgAppList():

	uid = get_jwt_identity()
	# data = request.get_json()
	oid= request.args['org']

	

	try:
		oid = int(oid)
 
		page = db.session.execute(db.select(Application).join(Application.orgs).where(OrgApplication.o_id == oid).where(OrgApplication.active == True)).scalars()

		res = {
		'list': [
			{
				'app_id' : p.id,
				'name': p.name,
				'description': p.description
			} for p in page.all()
		]
		}

		# j = json.dumps(res)
		return jsonify(res), 200

	except exc.SQLAlchemyError or ValueError:

		return jsonify({'errorMessage': "Couldn't get your organization applications"}), 404
	
	
# addOrgAppDevice route will handle POST requests, requiring JWT authentication to access this route. The route retrieves JSON data from the request body, which is expected to contain information about the device to be added, 
# including the application ID, device_eui, and the device nickname/human readable name provided by user.  if a device with the device EUI doesn't exist or same device name, then then a error message is returned with a conflicted HTTP code. If past queries are not successful, then the create a sensor object, link it with the specified application, and commit it to the database, returning ok HTTP code. If any SQLAlchemy error occurs during the database transaction, it returns a JSON response with an error message and an HTTP status code 404 (Not Found).
@app.route('/addOrgAppDevice', methods = ['POST']) 
@jwt_required() 
def addAppDevice():

	data = request.get_json()
	appId = data['appId']
	devEUI = data['devEUI']
	devName = data['devName']
	devName = data['devName']

	try:
		if ( db.session.execute(db.select(AppSensors).where(AppSensors.dev_eui == devEUI).where(AppSensors.app_id == appId)).scalar() is not None):
			return jsonify({'errorMessage': 'A device with this DEVICE EUI is already present'}), 409
		
		if(db.session.execute(db.select(AppSensors).where(AppSensors.dev_name == devName).where(AppSensors.app_id == appId)).scalar() is not None):
			return jsonify({'errorMessage': 'A device with this device name is already present, please choose a new name'}), 409

		if (db.session.execute(db.select(Device).where(Device.dev_eui == devEUI)).scalar() is not None ):
			
			app = db.session.execute(db.select(Application).where(Application.id == appId)).scalar()

			appSensor = AppSensors(app_id = app.id, dev_name= devName, dev_eui= devEUI)
			db.session.add(appSensor)
			db.session.commit()
			return jsonify({'DeviceAdded': True}), 200

		else:
			return jsonify({'DeviceAdded': False}), 200 
		
	except exc.SQLAlchemyError:

		return jsonify({'errorMessage': "Couldn't add your device"}), 404

# This function deletes the device's relationship to the application, effectively removing the relationship between these two things, and that device will now be bale to be added to another application.
@app.route('/removeOrgAppDevice', methods = ['PUT']) 
@jwt_required() 
def removeAppDevice():

	data = request.get_json()
	appId = data['appId']
	devEUI = data['devEUI']
	devName = data['devName']

	try:
		theDevice = db.session.query(AppSensors).filter(AppSensors.app_id == appId, AppSensors.dev_name == devName, AppSensors.dev_eui == devEUI).first()

		if theDevice:
			db.session.delete(theDevice)
			db.session.commit()
			return jsonify({'deviceRemoved': True}), 200
		
	except exc.SQLAlchemyError:
		return jsonify({'errorMessage': "Couldn't find your device"}), 404

# userOrgAppDevice route will handle GET requests, requiring JWT authentication to access this route. The route will retrieve the 'app' and 'devName' parameters from the URL query string, convert the retrieved 'appId' to an integer, the fetched device EUI information is formatted into a JSON response with ok HTTP code,
#  If any SQLAlchemy error occurs during the database query or if the 'appId' cannot be converted to an integer (ValueError), it returns a JSON response with an error message and an HTTP status code 404 
@app.route('/userOrgAppDevice', methods = ['GET']) 
@jwt_required() 
def getOrgAppDevice():
	appId = request.args['app']
	devName = request.args['devName']



	try:
		appId = int(appId)

		page = db.session.execute(db.select(AppSensors.dev_eui).where(AppSensors.app_id == appId).where(AppSensors.dev_name == devName)).scalar()

		res = {
			'dev_eui': page
		}

		return jsonify(res), 200
	
	except exc.SQLAlchemyError or ValueError:

		return jsonify({'errorMessage': "couldn't retrieve the sensor of this application"}), 404
	



# userOrgAppDeviceList route will handle GET requests, requiring JWT authentication to access this route.retrieves the user ID (identity) from the JWT token in the request header, retrieves the 'app' parameter from the URL query string, which is expected to contain the app ID, 
# then  attempts to convert the retrieved 'appId' to an integer. Then the fetched device information is formatted into a JSON response with ok HTTP code. If any SQLAlchemy error occurs during the database query or if the 'appId' cannot be converted to an integer (ValueError), it returns a JSON response with an error message and an HTTP status code 404 
@app.route('/userOrgAppDeviceList', methods = ['GET']) 
@jwt_required() 
def getOrgAppDeviceList():

	uid = get_jwt_identity()
	# data = request.get_json()
	appId = request.args['app']


	try:
		appId = int(appId)

		page = db.session.execute(db.select(AppSensors).where(AppSensors.app_id == appId)).scalars()

		res = {
			'list': [
				{
					'app_id': p.app_id,
					'name': p.dev_name,
					'dev': p.dev_eui

				} for p in page.all()
			]
		}

		return jsonify(res), 200
	
	except exc.SQLAlchemyError or ValueError:

		return jsonify({'errorMessage': "couldn't retrieve the sensors of this application"}), 404
	
	

#Colins works from __init__ file###################################################################################################


@app.route('/data/<string:dev_id>/<string:numEnt>', methods=['GET'])
@jwt_required()
def get_data(dev_id, numEnt):
	print('\n\nIn Get Data')
	try:
		records = read_records('lab_sensor_json', f"dev_eui = '{dev_id}'", None , numEnt ) #hard coded for test
		data = parse_data(records)
		print(f'\tdata : {data}')
		print('\n\nExit Get Data')
		print('------------------------\n\n')
		return jsonify(data), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
    
@app.route('/alt_data', methods=['GET'])
@jwt_required()
def get_alt_data():
	print('\n\nIn Get Alt Data')
	try:
		records = read_records('lab_sensor_json') #hard coded for test
		data = parse_data(records)
		print('\n\nExit Get Alt Data')
		print('------------------------\n\n')
		return jsonify(data), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
    
@app.route('/dev_id', methods=['GET'])
@jwt_required()
def get_dev_id():
	print('\n\nIn Get Dev Id')
	try:
		records = read_records('lab_sensor_json', 'distinct') #hard coded for test
		# data = parse_data(records
		print('\n\nExit Get Dev Id')
		print('------------------------\n\n')
		return jsonify(records), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
@app.route('/metadata/<string:dev_id>/<string:numEnt>', methods=['GET'])
@jwt_required()
def get_metadata(dev_id, numEnt):
	print('\n\nIn Get Metadata')
	try:
		records = read_records('lab_sensor_json', 'metadata', dev_id, numEnt) #hard coded for test
		print('\n\nExit Get Metadata')
		print('------------------------\n\n')
		return jsonify(records), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
@app.route('/payload/<string:dev_id>/<string:numEnt>', methods=['GET'])
@jwt_required()
def get_payload(dev_id, numEnt):
	print('\n\nIn Get Payload')
	try:
		records = read_records('lab_sensor_json', 'payload', dev_id, numEnt) #hard coded for test
		print('\n\nExit Get Payload')
		print('------------------------\n\n')
		return jsonify(records), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
@app.route('/location', methods=['GET'])
@jwt_required()
def get_location():
	print('\n\nIn Get Location')
	try:
		records = read_records('device_location', 'location') #hard coded for test
		# data = parse_data(records)
		print('\n\nExit Get Location')
		print('------------------------\n\n')
		return jsonify(records), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
@app.route('/devLocation/<string:dev_id>', methods=['GET'])
@jwt_required()
def get_device_location(dev_id):
	print('\n\nIn Get Device Location')
	try:
		records = read_records('device_location', 'device_location', dev_id) #hard coded for test
		# data = parse_data(records)
		print('\n\nExit Get Device Location')
		print('------------------------\n\n')
		return jsonify(records), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
@app.route('/payloadStats/<string:dev_id>/<string:numEnt>', methods=['GET'])
@jwt_required()
def get_payloadStats(dev_id, numEnt):
	print('\n\nIn Get Payload Stats')
	try:
		records = read_records('lab_sensor_json', 'payloadStats', dev_id, numEnt) #hard coded for test
		data= getStats(records)
		print('\n\nExit Get Payload Stats')
		print('------------------------\n\n')
		# print(data)
		return jsonify(data), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
@app.route('/metadataStats/<string:dev_id>/<string:numEnt>', methods=['GET'])
@jwt_required()
def get_metadataStats(dev_id, numEnt):
	print('\n\nIn Get Metadata Stats')
	try:
		records = read_records('lab_sensor_json', 'metadataStats', dev_id, numEnt) #hard coded for test
		data= getStats(records)
		# print(data)
		print('\n\nExit Get Metadata Stats')
		print('------------------------\n\n')
		return jsonify(data), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
@app.route('/getdevAnnotation/<string:dev_id>', methods=['GET'])
# @jwt_required()
def get_devAnnotation(dev_id):
	print('\n\nIn Get Device Annotations')
	print(f'get annotation dev_id {dev_id}')
	try:
		records = read_records('annotation', 'annotation', dev_id) #hard coded for test
		print(records)
		print('\n\nExit Get Device Annotations')
		print('------------------------\n\n')
		return jsonify(records), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
@app.route('/setdevAnnotation/<string:dev_id>/<string:data>', methods=['GET'])
@jwt_required()
def set_devAnnotation(dev_id, data):
	print('\n\nIn Set Device Annotations')
	print(f'dev_id: {dev_id}, Data: {data}')
	try:
		update_record('annotation', 'annotation', dev_id, data) #hard coded for test
		records = read_records('annotation', 'annotation', dev_id)
		# print(records)
		print('\n\nExit Set Device Annotations')
		print('------------------------\n\n')
		return jsonify(records), 200 #200 shows correct  http responses
	except Exception as e:
		print(f'error: {e}')
		return jsonify({'Error': str(e)}), 500 #500 shows server error


##################################################################################################################

if __name__ == '__main__':
	with app.app_context():
		#db.create_all()
		#OrgAccount.__table__.drop(db.engine)
		#Account.__table__.drop(db.engine)
		#AppSensors.__table__.drop(db.engine)
		#OrgApplication.__table__.drop(db.engine)
		#Application.__table__.drop(db.engine)
		app.run(debug = True)
