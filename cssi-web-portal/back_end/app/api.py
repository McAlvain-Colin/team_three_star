import json
from flask import Flask, request, jsonify, url_for, make_response
from flask_cors import CORS
import datetime
# import dbinteractions
from flask_mail import Mail, Message

from flask_jwt_extended import (create_access_token, JWTManager,
								jwt_required, get_jwt_identity,
								set_access_cookies, unset_jwt_cookies
								)

from itsdangerous import URLSafeTimedSerializer, SignatureExpired

import bcrypt


#db imports
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, types, Text, LargeBinary, ForeignKey, select, update, exc

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, registry, relationship
from typing_extensions import Annotated
from typing import List

#for query paramters
from urllib.parse import unquote


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


app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:@localhost/postgres'
db.init_app(app)



app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = '@gmail.com' # ALTERED FOR PRIVACY
app.config['MAIL_PASSWORD'] = ''     # ALTERED FOR PRIVACY

#added this line to specify where the JWT token is when requests with cookies are recieved
# app.config['JWT_TOKEN_LOCATION'] = ['cookies', 'headers', 'json']
app.config['JWT_SECRET_KEY'] = 'secret' # ALTERED FOR PRIVACY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes = 20)
CORS(app, resources={r'*': {'origins': 'http://localhost:4200'}})

JWTManager(app)

mail.init_app(app)
s = URLSafeTimedSerializer('email-secret') 



#models.py db things
#REQUIRED#############################




class Account(Base):
	__tablename__ = "Account"

	id:Mapped[int] = mapped_column(primary_key= True) #implicitly Serail datatype in Postgres db
	email:Mapped[str] = mapped_column(unique= True)
	password:Mapped[bytes] = mapped_column(types.LargeBinary())
	verified: Mapped[bool] = mapped_column(unique= False)
	active: Mapped[bool] = mapped_column(unique= False)

	orgAccounts: Mapped[List['OrgAccount']] = relationship(back_populates='account')

	def __init__(self, email, password, verified, active):
		self.email = email
		self.password = password
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
	dev_name: Mapped[str] = mapped_column(String, nullable= False)
	dev_eui: Mapped[str] = mapped_column(Text, primary_key= True)
#     devices: Mapped['Device'] = relationship(back_populates= 'appDevices')

with app.app_context():
# for creating db
	db.reflect()

# this table represent the lab sensor json provided by Zach
# class Device(Base):
#     __tablename__ = db.metadata.tables['lab_sensor_json']
	
#     dev_eui: Mapped[str] = mapped_column(Text, primary_key= True) 

			



###############################

@app.route('/')
def index():
	return "return backend home message"

#using flask JWT extended based on the example provided in docs using JWT tokens.
@app.route('/login', methods = ['POST'])
# @cross_origin()
def login_user():

	data = request.get_json()
	email = data['email']
	password =  data['password']

	user = db.session.execute(db.select(Account).filter_by(email = email)).scalar()
	if(user == None):
		return make_response(jsonify({'login': False}), 200)

	if bcrypt.checkpw(password.encode('utf-8'), user.password): #database logic for searching goes here
	
		token = create_access_token(identity = user.id)
		return make_response(jsonify({'login': True, 'token': token}), 200)

	else:
		return make_response(jsonify({'login': False}), 200)


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


	hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

	emailtoken = s.dumps(email, salt='email-confirm')

	# dbinteractions.createMember(email, password, False, bcrypt)
	newUser = Account(email, hashed, False, True)
	db.session.add(newUser)
	db.session.commit()


	msg = Message('Confirm Email', sender='ssiportalconfirmation@gmail.com', recipients= [email])

	link = url_for('confirm_email', token = emailtoken, _external = True)

	msg.body = 'email confirmation link {}'.format(link)

	mail.send(msg)

	return jsonify({'emailConfirmation': True})

@app.route('/confirm_email/<token>')  
def confirm_email(token):

	try:
		email = s.loads(token, salt='email-confirm', max_age = 360)

		# dbinteractions.verifiyMember(email)
		newUser = db.session.execute(db.select(Account).filter_by(email = email)).scalar()
		newUser.verified = True

		db.session.commit()

		return '<h1>The email confirmation was successful, please login</h1>'
	except SignatureExpired:
		# dbinteractions.removeUnverifiedMember()
		newUser = db.session.execute(db.select(Account).filter_by(verified = False)).scalar()
	
		db.session.delete(newUser)
		db.session.commit()

		return '<h1>The email confirmation was unsuccessful, please try again</h1>'




@app.route('/logout', methods = ['DELETE'])  
@jwt_required()
def logout_user():

	#jwt token is removed from local storage on frontend

	return jsonify(deleted_user =  True)




@app.route('/deleteUser', methods = ['DELETE'])  
@jwt_required()
def deleteUser():
	# data = request.get_json()
	#remove user to database code

	#need to add revoked token to revoked list


	return jsonify(deleted_user =  True)



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
		return make_response(res, 200)
	
	except Exception as e:

		return make_response({'error': str(e)}, 404)
	
	

@app.route('/userJoinedOrgList', methods = ['GET']) 
@jwt_required() 
def getJoinedOrgList():

	uid = get_jwt_identity()

	print(uid)
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
	
	except Exception as e:

		return make_response({'error': str(e)}, 404)
	
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
		print(res)
		return make_response(res, 200)
	
	except Exception as e:

		return make_response({'error': str(e)}, 404)


@app.route('/createOrgApp', methods = ['POST'])  
@jwt_required()
def createOrgApplication():

	data = request.get_json() #uid, org titel, org descritpion
	orgName = data['orgName']
	appName = data['appName']
	appDescript = data['appDescript']

	#link the app with the org
	newApp= Application(name= appName, description= appDescript)

	org = db.session.execute(db.select(Organization).where(Organization.name == orgName)).scalar()


	orgApp = OrgApplication(app= newApp, org= org)

	db.session.add(newApp)
	db.session.commit()
	db.session.add(orgApp)
	db.session.commit()



	return jsonify(orgCreated = True)




@app.route('/userOrgAppList', methods = ['GET']) 
@jwt_required() 
def getOrgAppList():

	uid = get_jwt_identity()
	# data = request.get_json()
	orgName = request.args['org']
	print(orgName)

	oid = db.session.execute(db.select(Organization.id).where(Organization.name == orgName)).scalar()
	
	# oid = int(data['oid'])
	

	try:
		page = db.session.execute(db.select(Application).join(Application.orgs).where(OrgApplication.o_id == oid)).scalars()

		res = {
		'list': [
		{
			'app_id' : p.id,
			'name': p.name
		} for p in page.all()
		]
		}

		# j = json.dumps(res)
		return jsonify(res), 200
	
	except Exception as e:

		return jsonify({'error': str(e)}), 404
	
	

# @app.route('/addOrgAppDeviceList', methods = ['POST']) 
# @jwt_required() 
# def addDeviceList():
#     if (db.session.execute(db.select(Device).where(Device.dev_eui == 'A2')).scalar() is not None ):
		
#         app = db.session.execute(db.select(Application).where(Application.id == 1)).scalar()

#         appSensor = AppSensors(app_id = app.id, dev_name='myDevice', dev_eui= 'A2')
#         db.session.add(appSensor)
#         db.session.commit()
#     else:
#         jsonify({'DeviceAdded': False})


@app.route('/userOrgAppDeviceList', methods = ['GET']) 
@jwt_required() 
def getOrgAppDeviceList():

	uid = get_jwt_identity()
	data = request.get_json()
	pageNum = data['pageNum']
	appid = data['oid']



	try:
		page = db.session.execute(db.select(AppSensors).where(AppSensors.app_id == 1)).scalars()

		# # print(page.items) #doesnt work if not specified the object attributes to expose
		res = {
		# 'totalPages': page.pages,
		'list': [
			{
				'app_id': p.app_id,
				'name': p.dev_name,
				'dev': p.dev_eui

			} for p in page.all()
		]
		}

		

		return make_response(res, 200)
	
	except Exception as e:

		return make_response({'error': str(e)}, 404)
	
	


if __name__ == '__main__':
	#db.drop_all()
	#db.create_all()
	app.run(debug = True)
