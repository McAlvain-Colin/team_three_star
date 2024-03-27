from flask import Flask, request, jsonify, url_for, make_response
from flask_cors import CORS, cross_origin
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
from sqlalchemy import String, types, text, LargeBinary, ForeignKey, update, create_engine, MetaData

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, registry, relationship
from typing_extensions import Annotated
from typing import List


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

meta = MetaData()

engine = create_engine('postgresql://postgres:BigFakey14?@localhost/postgres')

meta.reflect(bind=engine)


app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:@localhost/postgres'
db.init_app(app)



app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = '5@gmail.com' # ALTERED FOR PRIVACY
app.config['MAIL_PASSWORD'] = ''     # ALTERED FOR PRIVACY

#added this line to specify where the JWT token is when requests with cookies are recieved
# app.config['JWT_TOKEN_LOCATION'] = ['cookies', 'headers', 'json']
app.config['JWT_SECRET_KEY'] = 'secret' # ALTERED FOR PRIVACY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(minutes = 20)
CORS(app, resources={r'*': {'origins': 'http://localhost:4200'}})

JWTManager(app)

mail.init_app(app)
s = URLSafeTimedSerializer('email secret')



#models.py db things
#REQUIRED#############################
class Account(Base):
    __tablename__ = "Account"

    id:Mapped[int] = mapped_column(primary_key= True) #implicitly Serail datatype in Postgres  db
    email:Mapped[str] = mapped_column(unique= True)
    password:Mapped[bytes] = mapped_column(types.LargeBinary())
    verified: Mapped[bool] = mapped_column(unique= False)

    orgAccounts: Mapped[List['OrgAccount']] = relationship(back_populates='account')

    def __init__(self, email, password, verified):
        self.email = email
        self.password = password
        self.verified = verified

    def __repr__(self):
        return f'(id = {self.id}), salt = {self.salt}, email = {self.email}'
   

class Organization(Base):
    __tablename__ = "Organization"

    id:Mapped[int] = mapped_column(primary_key= True) #implicitly Serail datatype in Postgres  db
    name: Mapped[str] = mapped_column(nullable= False)
    description:Mapped[str] = mapped_column(nullable= True)
    exists: Mapped[bool] = mapped_column(nullable=False)

    orgAccounts: Mapped[List['OrgAccount']] = relationship(back_populates='org')


    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f'organization: {self.name}'
   

class OrgAccount(Base):
    __tablename__ = 'OrgAccount'

    id:Mapped[int] = mapped_column(primary_key= True) #implicitly Serail datatype in Postgres  db

    a_id: Mapped[int] = mapped_column(ForeignKey('Account.id'))
    account: Mapped['Account'] = relationship(back_populates='orgAccounts')

    o_id: Mapped[int] = mapped_column(ForeignKey('Organization.id'))
    org: Mapped['Organization'] = relationship(back_populates='orgAccounts')

   
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
    newUser = Account(email, hashed, False)
    db.session.add(newUser)
    db.session.commit()
   

    msg = Message('Confirm Email', sender='davidadbdiel775@gmail.com', recipients= [email])

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

        return '<h1>The email confirmation was succesful, please login</h1>'
    except SignatureExpired:
        # dbinteractions.removeUnverifiedMember()
        newUser = db.session.execute(db.select(Account).filter_by(verified = False)).scalar()
       
        db.session.delete(newUser)
        db.session.commit()

        return '<h1>The email confirmation was unsuccesful, please try again</h1>'




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
    userId = data['uid']
    orgName = data['orgName']
    descript = data['orgDescript']

    #database code
    newOrg = Organization(orgName, descript)

    user = db.session.execute(db.select(Account).filter_by(id = userId)).scalar()


    #link the account with the org
    orgAcc = OrgAccount(account= user, org= newOrg)

    db.session.add(newOrg)
    db.session.commit()
    db.session.add(orgAcc)
    db.session.commit()
   


    return jsonify(orgCreated = True)



@app.route('/userOrgList', methods = ['GET'])  
def getOrgList():

    uid = get_jwt_identity()
    data = request.get_json()
    pageNum = data['pageNum']
    # currPage = data['currPage']

    if pageNum <= db.paginate(db.select(Organization).join(Organization.orgAccounts).filter_by(a_id = uid), per_page= 20).pages:
        try:
            page = db.paginate(db.select(Organization).join(Organization.orgAccounts).filter_by(a_id = uid), page= pageNum, per_page= 20)
            res = {
                'currentPage': pageNum,
                'pageTotal': page.pages,
                'list': [
                            {
                                'name': p.name,
                                'description': p.description
                            } for p in page.items
                        ]
            }

            return make_response(res, 200)
       
        except Exception as e:

            return make_response({'error': str(e)}, 404)
       
    else:
        return make_response({'error': "page doesn't exist"})

@app.route('/inviteUser', methods = ['PUT'])  
def invite_user():

    data = request.get_json()
    sender = data['senderName']
    email = data['email']
    orgid = data['orgId']
    orgName = data['orgName']
   
    emailtoken = s.dumps(email, salt='email-invite')

    msg = Message("Organization Invite CSSI Web Portal", sender='davidadbdiel775@gmail.com', recipients= [email])

    link = url_for('invite_email', token = emailtoken, _external = True)

    msg.body = sender + ' has sent you a request to join their organization! Would you like to join ' + orgName + '?'
    msg.body = msg.body + 'Join org link {}'.format(link)

    mail.send(msg)

    #Check if the email is clicked, if yes, then find the org and add user to it.

    return jsonify({'emailConfirmation': True})

@app.route('/invite_email/<token>')  
def confirm_email(token):

    try:
        email = s.loads(token, salt='email-invite', max_age = 360)
   
        # dbinteractions.verifiyMember(email)
        newUser = db.session.execute(db.select(Account).filter_by(email = email)).scalar()
        newUser.verified = True

        db.session.commit()

        return '<h1>The email confirmation was succesful, please login</h1>'
    except SignatureExpired:
        # dbinteractions.removeUnverifiedMember()
        newUser = db.session.execute(db.select(Account).filter_by(verified = False)).scalar()
       
        db.session.delete(newUser)
        db.session.commit()

        return '<h1>The email confirmation was unsuccesful, please try again</h1>'


@app.route('/deleteOrg', methods = ['PUT'])
def delete_org():
	ORGS = meta.tables[Organization.__tablename__]

	deleteOrg = update(ORGS)
	deleteOrg = deleteOrg.values({"exists" : True})
	deleteOrg = deleteOrg.where(ORGS.c.id == 1) #Insert the id that would be given in the data
	db.session.execute(deleteOrg)
	db.session.commit()

if __name__ == '__main__':
    app.run(debug = True)

#

