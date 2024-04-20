import json
from flask import Flask, request, jsonify, url_for, make_response
from flask_cors import CORS
import datetime
from datetime import timezone
# import dbinteractions
from flask_mail import Mail, Message

from flask_jwt_extended import (create_access_token, JWTManager, get_jti,
								jwt_required, get_jwt_identity,
								create_refresh_token, get_jwt
								)

from itsdangerous import URLSafeTimedSerializer, SignatureExpired

import bcrypt


#db imports
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, types, Text, LargeBinary, ForeignKey, select, update, exc
from sqlalchemy.sql.functions import now

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


app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Locomexican22@localhost/postgres'
db.init_app(app)



app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'cssiportalconfirmation@gmail.com' # ALTERED FOR PRIVACY
app.config['MAIL_PASSWORD'] = 'cljt ezlp ctmt hgmr'     # ALTERED FOR PRIVACY

#added this line to specify where the JWT token is when requests with cookies are recieved

app.config['JWT_SECRET_KEY'] = 'secret' # ALTERED FOR PRIVACY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes = 1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = datetime.timedelta(minutes= 4)

CORS(app, resources={r'*': {'origins': 'http://localhost:4200'}})

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




#STEP 1 ADD THIS CLASS FOR KEEPING TRACK OF THE USER REVOKED TOKENS 
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
# class Device(Base):
#     __tablename__ = db.metadata.tables['lab_sensor_json']
	
#     dev_eui: Mapped[str] = mapped_column(Text, primary_key= True) 

			
#NEED TO REMOVE THE INDEX ROUTE, 

###############################

# @app.route('/')
# def index():
# 	return "return backend home message"


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

	hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

	emailtoken = s.dumps(email, salt='email-confirm')

	newUser = Account(email, hashed, name,  False, True)
	db.session.add(newUser)
	db.session.commit()


	msg = Message('Confirm Email', sender='cssiportalconfirmation@gmail.com', recipients= [email])

	link = url_for('confirm_email', token = emailtoken, _external = True)

	msg.body = 'email confirmation link {}'.format(link)

	mail.send(msg)

	return jsonify({'emailConfirmation': True})

@app.route('/confirm_email/<token>')  
def confirm_email(token):

	try:
		email = s.loads(token, salt='email-confirm', max_age = 360)

		newUser = db.session.execute(db.select(Account).filter_by(email = email)).scalar()
		newUser.verified = True

		db.session.commit()

		return '<h1>The email confirmation was successful, please login</h1>'
	except SignatureExpired:
		newUser = db.session.execute(db.select(Account).filter_by(verified = False)).scalar()
	
		db.session.delete(newUser)
		db.session.commit()

		return '<h1>The email confirmation was unsuccessful, please try again</h1>'




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

	joinUser = db.session.execute(db.select(Account).filter_by(email = email)).scalar()
	if joinUser is None:
		return jsonify(inviteSent = False)

	orgacc = OrgAccount(a_id= joinUser.id, o_id= orgId)
	orgacc.r_id = 3
	orgacc.active = False

	db.session.execute(orgacc)
	db.session.commit()

	mail.send(msg)

@app.route('/invite_email/<token>')  
def invite_email(token):

	try:
		infoLoaded = s.loads(token, salt='email-invite', max_age = 360)
		infoLoaded = infoLoaded.split("|")
		email = infoLoaded[0]
		orgId = infoLoaded[1]

		joinUser = db.session.execute(db.select(Account).filter_by(email = email)).scalar()
		if joinUser is None:
			return "<h1>User doesn't have an acccount!<h1>"

		orgAccount = db.session.execute(db.select(OrgAccount).where(OrgAccount.a_id == joinUser.id).where(OrgAccount.o_id == orgId))
		orgAccount.active = True
		db.session.execute(orgAccount)
		db.session.commit()

		return '<h1>The organization invite was successful, please check your organizations.</h1>'
	except SignatureExpired:
		return '<h1>The email invitation has expired, please request another invite.</h1>'


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
	orgId  = int(orgId)

	try:
		page = db.session.execute(db.select(Organization).where(Organization.id == orgId)).scalar()
		res  = {
			'name': page.name,
			'description': page.description
		} 
		return jsonify(res), 200

	except exc.SQLAlchemyError:
		return jsonify({'error': "couldn't get your org with name specified"}), 404


		
@app.route('/OrgMembers', methods = ['GET']) 
@jwt_required() 
def getOrgMembers():

	orgId = request.args['org']

	orgId = int(orgId)

	try:
		page = db.session.execute(db.select(Account).join(Account.orgAccounts).where((OrgAccount.r_id == 2) | (OrgAccount.r_id == 3)).where(OrgAccount.o_id == orgId).where(Account.verified  == True).where(Account.active == True)).scalars()

		res = {
			'list': [
				{
				'a_id' : p.id,
				'name': p.name

				} for p in page.all()
			]
		}
		return jsonify(res), 200
	
	except exc.SQLAlchemyError:
		return jsonify({'error': "couldn't get your org members"}), 404




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

		return jsonify({'error': "couldn't get your owned orgs"}), 404
	
	

@app.route('/userJoinedOrgList', methods = ['GET']) 
@jwt_required() 
def getJoinedOrgList():

	uid = get_jwt_identity()

	try:
		page = db.session.execute(db.select(Organization).join(Organization.orgAccounts).where(OrgAccount.a_id == uid).where(OrgAccount.r_id == 2).where(OrgAccount.r_id == 3).where(OrgAccount.active == True)).scalars()

		res = {
		'list': [
				{
					'o_id' : p.id,
					'name': p.name,
					'description': p.description
				} for p in page.all()
			]
		}
		res = json.dumps(res)
		return make_response(res, 200)
	
	except exc.SQLAlchemyError:

		return make_response({'error': "Couldn't get your Joined Orgs"}, 404)
	
@app.route('/getOrgInfo', methods = ['GET'])
@jwt_required()
def getOrgInfo():
	uid = get_jwt_identity()
	orgId = request.args['org']

	try:
		userOrg = db.session.execute(db.select(Organization).join(Organization.orgAccounts).where(OrgAccount.a_id == uid).where(OrgAccount.o_id == orgId)).scalar()

		res = {
		'list': [
				{
					'o_id' : orgId,
					'name': userOrg.name,
					'description': userOrg.description
				}
			]
		}
		res = json.dumps(res)
		return make_response(res, 200)
	
	except Exception as e:

		return make_response({'error': str(e)}, 404)


@app.route('/createOrgApp', methods = ['POST'])  
@jwt_required()
def createOrgApplication():

	data = request.get_json() #uid, org titel, org descritpion
	orgId = data['orgId']
	appName = data['appName']
	appDescript = data['appDescript']

	#link the app with the org
	newApp= Application(name= appName, description= appDescript)

	org = db.session.execute(db.select(Organization).where(Organization.id == orgId)).scalar()


	orgApp = OrgApplication(app= newApp, org= org)

	db.session.add(newApp)
	db.session.commit()
	db.session.add(orgApp)
	db.session.commit()

	return jsonify(orgCreated = True)




@app.route('/userOrgApp', methods = ['GET']) 
@jwt_required() 
def getOrgApp():

	app_id = request.args['app']

	app_id = int(app_id)

	try:

		app = db.session.execute(db.select(Application).where(Application.id == app_id)).scalar()
		res = {
				'app_id': app.id,
				'name': app.name,
				'description': app.description
		}
		return jsonify(res), 200
	
	except Exception as e:

		return jsonify({'error': str(e)}), 404
	



@app.route('/userOrgAppList', methods = ['GET']) 
@jwt_required() 
def getOrgAppList():

	uid = get_jwt_identity()
	# data = request.get_json()
	oid= request.args['org']

	

	try:
		page = db.session.execute(db.select(Application).join(Application.orgs).where(OrgApplication.o_id == oid)).scalars()

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

	except Exception as e:
		return jsonify({'error': str(e)}), 404
	
	

@app.route('/addOrgAppDevice', methods = ['POST']) 
@jwt_required() 
def addAppDevice():

	data = request.get_json()
	appId = data['appId']
	devEUI = data['devEUI']

	if (db.session.execute(db.select(Device).where(Device.dev_eui == devEUI)).scalar() is not None ):
		
		app = db.session.execute(db.select(Application).where(Application.id == appId)).scalar()

		appSensor = AppSensors(app_id = app.id, dev_name='myDevice', dev_eui= devEUI)
		db.session.add(appSensor)
		db.session.commit()
		return jsonify({'DeviceAdded': True}), 200

	else:
		return jsonify({'DeviceAdded': False}), 200  





@app.route('/userOrgAppDevice', methods = ['GET']) 
@jwt_required() 
def getOrgAppDevice():
	appId = request.args['app']
	devName = request.args['devName']

	appId = int(appId)


	try:
		page = db.session.execute(db.select(AppSensors.dev_eui).where(AppSensors.app_id == appId).where(AppSensors.dev_name == devName)).scalar()

		res = {
			'dev_eui': page
		}

		return jsonify(res), 200
	
	except exc.SQLAlchemyError:

		return jsonify({'error': "couldn't retieve the sensors of this application"}), 404
	




@app.route('/userOrgAppDeviceList', methods = ['GET']) 
@jwt_required() 
def getOrgAppDeviceList():

	uid = get_jwt_identity()
	# data = request.get_json()
	appId = request.args['app']

	appId = int(appId)

	try:
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
	
	except exc.SQLAlchemyError:

		return jsonify({'error': "couldn't retieve the sensors of this application"}), 404
	
	


if __name__ == '__main__':
	with app.app_context():
		
		app.run(debug = True)
