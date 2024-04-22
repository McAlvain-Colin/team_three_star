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

#for query paramters
# from urllib.parse import unquote


#db things###########################
str_320 = Annotated[str, 320]


class Base(DeclarativeBase):
	registry = registry(type_annotation_map={
		str_320: String(320)

	})
	pass

db = SQLAlchemy(model_class=Base)

###############################
mail = Mail()


app = Flask(__name__)


app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:cssiwebportal2024@localhost/postgres'
db.init_app(app)



app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'cssiportalconfirmation@gmail.com' # ALTERED FOR PRIVACY
app.config['MAIL_PASSWORD'] = 'cljt ezlp ctmt hgmr'     # ALTERED FOR PRIVACY

#added this line to specify where the JWT token is when requests with cookies are recieved
app.config['JWT_SECRET_KEY'] = 'secret' # ALTERED FOR PRIVACY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes = 20)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(hours= 24)
CORS(app, resources={r'/*': {'origins': ['http://localhost:4200', 'http://localhost:5000']}})

jwt = JWTManager(app)

mail.init_app(app)
s = URLSafeTimedSerializer('email-secret') 



#REQUIRED#############################





class Account(Base):
	__tablename__ = "Account"

	id:Mapped[int] = mapped_column(primary_key= True) #implicitly Serail datatype in Postgres db
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

class Organization(Base):
	__tablename__ = "Organization"

	id:Mapped[int] = mapped_column(primary_key= True) #implicitly Serail datatype in Postgres db
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


# 1- admin, 2- PI, 3 - basic user.

class OrgAccount(Base):
	__tablename__ = 'OrgAccount'

	id:Mapped[int] = mapped_column(primary_key= True) #implicitly Serail datatype in Postgres db

	a_id: Mapped[int] = mapped_column(ForeignKey('Account.id'))
	account: Mapped['Account'] = relationship(back_populates='orgAccounts')

	o_id: Mapped[int] = mapped_column(ForeignKey('Organization.id'))
	org: Mapped['Organization'] = relationship(back_populates='orgAccounts')

	#added line/column for roles
	r_id:Mapped[int] = mapped_column()
	active: Mapped[bool] = mapped_column()



class Application(Base):
	__tablename__ = 'Application'

	id: Mapped[int] = mapped_column(primary_key= True)
	name : Mapped[str] = mapped_column(nullable= False)
	description: Mapped[str] = mapped_column(nullable= True)

	orgs: Mapped[List['OrgApplication']] = relationship(back_populates='app')

	appSensors: Mapped[List['AppSensors']] = relationship(back_populates='app')

	def __repr__(self):
		f'app: {self.id}, {self.name}'

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



class AppSensors(Base):
	__tablename__ = 'AppSensors'
	# __table_args__  = (ForeignKeyConstraint(['dev_eui'], ['lab_sensor_json.dev_eui']),)

	app_id: Mapped[int] = mapped_column(ForeignKey('Application.id'))
	app: Mapped['Application'] = relationship(back_populates= 'appSensors')

	# dev_eui needs to have the table name as stored in postgreSQL
	dev_name: Mapped[str] = mapped_column(String, nullable= False, unique= True)
	dev_eui: Mapped[str] = mapped_column(Text, primary_key= True)
#     devices: Mapped['Device'] = relationship(back_populates= 'appDevices')


class TokenBlockList(Base):
	__tablename__ = 'TokenBlockList'
	id: Mapped[int] = mapped_column(primary_key=True)
	jti: Mapped[str] = mapped_column(nullable=False, index=True)
	type: Mapped[str] = mapped_column(nullable=False)
	user_id: Mapped[int] = mapped_column(nullable=False)
	created_at: Mapped[datetime.datetime] = mapped_column(server_default= now(), nullable=False)
	valid: Mapped[bool] = mapped_column(nullable= False)



with app.app_context():
# for creating db
	db.reflect()

# this table represent the lab sensor json provided by Zach
class Device(Base):
    __tablename__ = db.metadata.tables['lab_sensor_json']
	
    dev_eui: Mapped[str] = mapped_column(Text, primary_key= True) 



			
# NEED TO REMOVE THE INDEX ROUTE, 

##############################

@app.route('/')
def index():
	return "return backend home message"



@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload: dict) -> bool:
	jti = jwt_payload['jti']
	token_valid = db.session.execute(db.select(TokenBlockList.valid).where(TokenBlockList.jti == jti)).scalar()
	# print(token_valid)
	return not token_valid


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



#using flask JWT extended based on the example provided in docs using JWT tokens.
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

#used to test authorized routes, only authenticated users can get this info
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

			


			msg = Message('Confirm Email', sender='cssiportalconfirmation@gmail.com', recipients= [email])

			link = url_for('confirm_email', token = emailtoken, _external = True)

			msg.body = 'email confirmation link {}'.format(link)

			mail.send(msg)

			return jsonify({'emailConfirmation': True})
		except exc.SQLAlchemyError:
			return jsonify({'errorMessage': "couldn't create a account" }), 409 



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

@app.route('/reset_email/<token>')  
def reset_email(token):

	try:
		email = s.loads(token, salt='reset-request', max_age = 360)

		resetToken = s.dumps(email, salt='reset-password')
		
		return redirect("http://localhost:4200/reset-password/" + resetToken, code=302)
	except SignatureExpired:
		return redirect("http://localhost:4200/login/false" , code=302)
	
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
		if db.session.query(checkOrgAccount.exists()).scalar():
			pass #Pass the creation function if it already exists
		else:
			orgacc = OrgAccount(a_id= joinUser.id, o_id= orgId)
			orgacc.r_id = 3
			orgacc.active = False

			db.session.add(orgacc)
			db.session.commit()
			
		mail.send(msg)
		return jsonify(inviteSent = True)

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


		
@app.route('/OrgMembers', methods = ['GET']) 
@jwt_required() 
def getOrgMembers():

	orgId = request.args['org']


	try:
		orgId = int(orgId)

		users = select(Account.id, Account.name, OrgAccount.r_id).join(OrgAccount).where(OrgAccount.o_id == orgId).where(OrgAccount.active == True).where(Account.verified  == True).where(Account.active == True)

		page = db.session.execute(users).all()

		res = {
			'list': [
				{
				'a_id' : p.id,
				'name': p.name,
				'r_id' : p.r_id
				} for p in page
			]
		}
		return jsonify(res), 200
	
	except exc.SQLAlchemyError or ValueError:
		return jsonify({'error': "couldn't get your org members"}), 404

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
					'description': p.description
				} for p in page.all()
			]
		}
		return jsonify(res), 200
	
	except exc.SQLAlchemyError:

		return jsonify({'errorMessage': "Couldn't get your owned organizations"}), 404
	
	

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
					'description': p.description
				} for p in page.all()
			]
		}
		print(res)
		res = json.dumps(res)
		return jsonify(res), 200
	
	except exc.SQLAlchemyError:

		return jsonify({'errorMessage': "Couldn't get your Joined Organizations"}), 404
	
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


@app.route('/createOrgApp', methods = ['POST'])  
@jwt_required()
def createOrgApplication():

	data = request.get_json() #uid, org titel, org descritpion
	orgId = data['orgId']
	appName = data['appName']
	appDescript = data['appDescript']

	APPS = db.metadata.tables[Application.__tablename__]
	ORGAPPS = db.metadata.tables[OrgApplication.__tablename__]

	checkApp = select(APPS).where(
		APPS.c.name == appName,
	)
	theApp = db.session.execute(checkApp).first()

	if theApp:
		updateOrgApp = update(ORGAPPS).values(active = True).where(ORGAPPS.c.app_id == theApp.id).where(ORGAPPS.c.o_id == orgId)
		db.session.execute(updateOrgApp)
		db.session.commit()
		return jsonify(orgCreated = True)

	#link the app with the org
	# try:
	orgId = int(orgId)
	newApp= Application(name= appName, description= appDescript)
	org = db.session.execute(db.select(Organization).where(Organization.id == orgId)).scalar()


	orgApp = OrgApplication(app= newApp, org= org, active=True)

	db.session.add(newApp)
	db.session.commit()
	db.session.add(orgApp)
	db.session.commit()

	return jsonify(orgCreated = True), 200

	# except exc.SQLAlchemyError or ValueError:

	# 	return jsonify({'errorMessage': "Couldn't add your application"}), 404

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
	
	

@app.route('/addOrgAppDevice', methods = ['POST']) 
@jwt_required() 
def addAppDevice():

	data = request.get_json()
	appId = data['appId']
	devEUI = data['devEUI']
	devName = data['devName']

	try:

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


@app.route('/data/<string:dev_id>', methods=['GET'])
@jwt_required()
def get_data(dev_id):
	print(f'dev_id: "{dev_id}"')
	try:
		records = read_records('lab_sensor_json', f"dev_eui = '{dev_id}'") #hard coded for test
		data = parse_data(records)
		return jsonify(data), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
    
@app.route('/alt_data', methods=['GET'])
@jwt_required()
def get_alt_data():
    try:
        records = read_records('lab_sensor_json') #hard coded for test
        data = parse_data(records)
        return jsonify(data), 200 #200 shows correct  http responses
    except Exception as e:
        print('error')
        return jsonify({'Error': str(e)}), 500 #500 shows server error
    
@app.route('/dev_id', methods=['GET'])
@jwt_required()
def get_dev_id():
    try:
        records = read_records('lab_sensor_json', 'distinct') #hard coded for test
        # data = parse_data(records
        return jsonify(records), 200 #200 shows correct  http responses
    except Exception as e:
        print('error')
        return jsonify({'Error': str(e)}), 500 #500 shows server error
@app.route('/metadata/<string:dev_id>', methods=['GET'])
@jwt_required()
def get_metadata(dev_id):
	try:
		records = read_records('lab_sensor_json', 'metadata', dev_id) #hard coded for test
		return jsonify(records), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
@app.route('/payload/<string:dev_id>', methods=['GET'])
@jwt_required()
def get_payload(dev_id):
	try:
		records = read_records('lab_sensor_json', 'payload', dev_id) #hard coded for test
		return jsonify(records), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
@app.route('/location', methods=['GET'])
@jwt_required()
def get_location():
    try:
        records = read_records('device_location', 'location') #hard coded for test
        # data = parse_data(records)
        return jsonify(records), 200 #200 shows correct  http responses
    except Exception as e:
        print('error')
        return jsonify({'Error': str(e)}), 500 #500 shows server error
@app.route('/payloadStats/<string:dev_id>', methods=['GET'])
@jwt_required()
def get_payloadStats(dev_id):
	try:
		records = read_records('lab_sensor_json', 'payloadStats', dev_id) #hard coded for test
		data= getStats(records)
		print(data)
		return jsonify(data), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
@app.route('/metadataStats/<string:dev_id>', methods=['GET'])
@jwt_required()
def get_metadataStats(dev_id):
	try:
		records = read_records('lab_sensor_json', 'metadataStats', dev_id) #hard coded for test
		data= getStats(records)
		print(data)
		return jsonify(data), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
@app.route('/getdevAnnotation/<string:dev_id>', methods=['GET'])
# @jwt_required()
def get_devAnnotation(dev_id):
	print(f'get annotation dev_id {dev_id}')
	try:
		records = read_records('annotation', 'annotation', dev_id) #hard coded for test
		print(records)
		return jsonify(records), 200 #200 shows correct  http responses
	except Exception as e:
		print('error')
		return jsonify({'Error': str(e)}), 500 #500 shows server error
@app.route('/setdevAnnotation/<string:dev_id>/<string:data>', methods=['GET'])
@jwt_required()
def set_devAnnotation(dev_id, data):
	print(f'dev_id: {dev_id}, Data: {data}')
	try:
		update_record('annotation', 'annotation', dev_id, data) #hard coded for test
		records = read_records('annotation', 'annotation', dev_id)
		print(records)
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
