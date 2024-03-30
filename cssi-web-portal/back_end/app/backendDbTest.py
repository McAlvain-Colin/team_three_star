from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, types, text, LargeBinary, ForeignKey, update, create_engine, MetaData

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, registry, relationship 
from typing_extensions import Annotated
from typing import List

from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired


from flask import Flask, url_for

#db things###########################
str_320 = Annotated[str, 320]


class Base(DeclarativeBase):
    registry = registry(type_annotation_map={
        str_320: String(320)

})
pass

db = SQLAlchemy(model_class=Base)


app = Flask(__name__)

meta = MetaData()

engine = create_engine('postgresql://postgres:@localhost/postgres')

meta.reflect(bind=engine)

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:@localhost/postgres'
db.init_app(app)

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = '@gmail.com' # ALTERED FOR PRIVACY
app.config['MAIL_PASSWORD'] = ''     # ALTERED FOR PRIVACY
app.config['SERVER_NAME'] = '127.0.0.1:5000'

s = URLSafeTimedSerializer('email secret')
mail = Mail(app)


class Account(Base):
	__tablename__ = "Account"

	id:Mapped[int] = mapped_column(primary_key= True) #implicitly Serail datatype in Postgres  db
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

	id:Mapped[int] = mapped_column(primary_key= True) #implicitly Serail datatype in Postgres  db
	name: Mapped[str] = mapped_column(nullable= False, unique= True)
	description:Mapped[str] = mapped_column(nullable= True)
	active: Mapped[bool] = mapped_column(unique= False)

	orgAccounts: Mapped[List['OrgAccount']] = relationship(back_populates='org')


	def __init__(self, name, description, active):
		self.name = name
		self.description = description
		self.active = active

	def __repr__(self):
		return f'organization: {self.name}'



#   1- admin, 2- PI, 3 - basic user. 

class OrgAccount(Base):
	__tablename__ = 'OrgAccount'

	id:Mapped[int] = mapped_column(primary_key= True) #implicitly Serail datatype in Postgres  db

	a_id: Mapped[int] = mapped_column(ForeignKey('Account.id'))
	account: Mapped['Account'] = relationship(back_populates='orgAccounts')

	o_id: Mapped[int] = mapped_column(ForeignKey('Organization.id'))
	org: Mapped['Organization'] = relationship(back_populates='orgAccounts')

	#added line/column for roles
	r_id:Mapped[int] = mapped_column()
	active: Mapped[bool] = mapped_column()





def func():
	# for creating a account
	#email ='lo'
	# hashed = 'h'
	# hashed = hashed.encode('utf-8')
	# newUser = Account(email, hashed, False)
	# db.session.add(newUser)
	# db.session.commit()

	#for creating a org
	# org = Organization('myOrg')
	# db.session.add(org)
	# db.session.commit()
	# orgName = 'myOrg'

	#for deleting an org, find the org and then alter the active bool value to be not active in org.
	# ORGS = db.metadata.tables[Organization.__tablename__]

	# deleteOrg = update(ORGS)
	# deleteOrg = deleteOrg.values({"active" : False})
	# deleteOrg = deleteOrg.where(ORGS.c.id == 2)
	# db.session.execute(deleteOrg)
	# db.session.commit()

	# email = 'manaj36551@storesr.com'
	# sender = "Huy"
	# orgName = "Totally Tahoe"

	# emailtoken = s.dumps(email, salt='email-invite')

	# msg = Message("Organization Invite CSSI Web Portal", sender='cssiportalconfirmation@gmail.com', recipients= [email])

	# link = url_for('invite_email', token = emailtoken, _external = True)

	# msg.body = sender + ' has sent you a request to join their organization! \n Would you like to join ' + orgName + '?\n'
	# msg.body = msg.body + 'Join org link: {}'.format(link)

	# mail.send(msg)

	# For adding to orgAccounts
	#newUser = db.session.execute(db.select(Account).filter_by(email = email)).scalar()

	#newOrg = db.session.execute(db.select(Organization).filter_by(name = 'myOrg')).scalar()

	#orgacc = OrgAccount(account= newUser, org= newOrg)

	#db.session.add(orgacc)
	#db.session.commit()
	pass

# @app.route('/invite_email/<token>')  
# def invite_email(token):

# 	try:
# 		email = s.loads(token, salt='email-invite', max_age = 360)

# 		joinUser = db.session.execute(db.select(Account).filter_by(email = email)).scalar()
# 		if joinUser is None:
# 			return "<h1>User doesn't have an acccount!<h1>"

# 		joinOrg = db.session.execute(db.select(Organization).filter_by(name = 'asdj')).scalar()

# 		orgacc = OrgAccount(account= joinUser, org= joinOrg)
# 		orgacc.r_id = 3
# 		orgacc.active = True

# 		db.session.add(orgacc)
# 		db.session.commit()

# 		return '<h1>The organization invite was successful, please check your organizations.</h1>'
# 	except SignatureExpired:
# 		return '<h1>The email invitation has expired, please request another invite.</h1>'

if __name__ == '__main__':
	with app.app_context():
		#db.create_all()
		#db.drop_all()
		func()
		app.run()
		#OrgAccount.__table__.create(engine) #How to create and drop specific tables