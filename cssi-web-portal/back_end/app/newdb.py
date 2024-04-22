import datetime
import json
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, types, Text, LargeBinary, ForeignKey

from sqlalchemy.sql.functions import now
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, registry, relationship
from typing_extensions import Annotated
from typing import List

from flask import Flask, jsonify, abort, Response, make_response
import sqlalchemy as sa


#db things###########################
str_320 = Annotated[str, 320]


class Base(DeclarativeBase):
    registry = registry(type_annotation_map={
    str_320: String(320)

    })
    pass

db = SQLAlchemy(model_class=Base)


app = Flask(__name__)


app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:cssiwebportal2024@localhost/postgres'
db.init_app(app)








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
class Device(Base):
    __tablename__ = db.metadata.tables['lab_sensor_json']
    
    dev_eui: Mapped[str] = mapped_column(Text, primary_key= True) 

            
          

# def func():


#     # o = db.session.execute(db.select(Organization).join(Organization.orgAccounts).filter_by(a_id = 1))

#     # print(o)
#     # for creating a account
#     # email ='hasasds1234dfg2143d@gmail.com'
#     # hashed = 'lol1'
#     # hashed = hashed.encode('utf-8')
#     # newUser = Account(email, hashed,'me', False, True )
#     # db.session.add(newUser)
#     # db.session.commit()

#     # # # # for creating a org
#     # org = Organization('5org', 'this is my first org', True)
#     # db.session.add(org)
#     # db.session.commit()

#     # org = Organization('6org', 'this is my first org', True)
#     # db.session.add(org)
#     # db.session.commit()

#     # org = Organization('7org', 'this is my first org', True)
#     # db.session.add(org)
#     # db.session.commit()

#     # org = Organization('8org', 'this is my first org', True)
#     # db.session.add(org)
#     # db.session.commit()

#     # org = Organization('9org', 'this is my first org', True)
#     # db.session.add(org)
#     # db.session.commit()

#     # org = Organization('10org', 'this is my first org', True)
#     # db.session.add(org)
#     # db.session.commit()


#     # For adding to orgAccounts
#     # newUser = db.session.execute(db.select(Account).filter_by(id = 5)).scalar()
#     # newOrg = db.session.execute(db.select(Organization).filter_by(id = 1)).scalar()

#     # # # # newOrg = Organization('lol', 'testintg')

#     # # # # #link the account with the org
#     # # for i in range(1,7):
#     # # orgAcc = OrgAccount(a_id= 1, o_id= i, r_id = i % 4)

#     # orgAcc = OrgAccount(a_id= newUser.id, o_id= newOrg.id, r_id = 3, active=True)


#     # db.session.add(orgAcc)
#     # db.session.commit()
#     # try:

#     # page = db.paginate(db.select(Account).filter_by(id = 1), page=1, per_page=5)
#     # j = [
#     # {
#     # 'id': p.id,
#     # 'email': p.email
#     # } for p in page.items
#     # ]
#     # print(j)
#     # except Exception as e:
#     # print(str(e))
#     # k = make_response({'error': str(e)}, 404)

#     # print(k)

#     # select(Organization).join(Organization.orgAccounts)
#     # page = db.paginate(db.select(Organization).filter_by(a_id = 1), page= 1, per_page= 10)
#     # res = {'total': page.pages,
#     # 'list': [
#     # {
#     # 'role': 1,

#     # 'name': p.name,
#     # 'description': p.description
#     # } for p in page.items
#     # ]
#     # }



#     # page = db.paginate(db.select(Organization).filter_by(id = 1)).pages




#     # THIS IS BETTER VERSION OF WHAT TO DO with orhg info and org account role id
#     # o = db.session.execute(db.select(OrgAccount.r_id, Organization).join_from(Organization, OrgAccount))


#     # print(o.all())
#     # print(o.all())
#     # for i in o.all():
#     # print('rid:', i.r_id)
#     # print('org name:', i.Organization.name)



#     # this works forr joins ACTUALY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

#     # o = db.session.execute(db.select(OrgAccount.r_id, Organization).join(Organization.orgAccounts).filter_by(a_id = 1))

#     # print(o.all())
#     # # print(o.all())
#     # for i in o.all():
#     # print('rid:', i.r_id)
#     # print('org name:', i.Organization.name)




#     # page = db.paginate(db.select(OrgAccount.r_id, Organization).join(OrgAccount.org).filter_by(a_id = 1), per_page = 1)

#     # res = {'total': page.pages,
#     # 'list': [
#     # {
#     # 'role': 1,

#     # 'name': p.name,
#     # 'description': p.description
#     # } for p in page.items
#     # ]
#     # }


#     # page = db.paginate(db.select(Organization).join(Organization.orgAccounts).filter_by(a_id = 1), per_page = 1)

#     # print(page.items)

#     # # print(res.items)

#     ############################################################
#     # working for reading orgs associated with an account org - orgAccount working

#     # page = db.paginate(db.select(Organization).join(Organization.orgAccounts).filter_by(a_id = 1), page= 1, per_page= 10)
#     # for i in page.items:
#     # print(i.r_id)
#     # res = {'total': page.pages,
#     # 'list': [
#     # {
#     # # 'role': p.r_id
#     # 'o_id' : p.id,
#     # 'name': p.name,
#     # 'description': p.description
#     # } for p in page.items
#     # ]
#     # }

#     # print(res)


#     ####################################################################
#     # get org with id = 1
#     # org = db.session.execute(db.select(Organization).where(Organization.id == 1)).scalar()

#     # print(org.id)

#     # acc = db.session.execute(db.select(Account).where(Account.id == 1)).scalar()
#     # print(acc.email)

#     # orgAcc =OrgAccount(account= acc, org= org, r_id = 1)
#     # db.session.add(orgAcc)
#     # db.session.commit()
#     # # # AppSensors()
#     # oApp = OrgApplication(description='for mah testing', o_id= org.id)

#     # db.session.add(oApp)
#     # db.sesson.commit()

#     # app = Application(name= 'mwryjnszugtrbApp', description= 'idk')
#     # db.session.add(app)
#     # db.session.commit()






#     # res = db.session.execute(db.select(Application).where(Application.id == 5)).scalar()

#     # print(res.name)

#     # orgApp = OrgApplication(app= res, org= org)
#     # db.session.add(orgApp) 
#     # db.session.commit()
        
        
        
        
        
        
        
        
#     # json_data = json.dumps(res)
#     # t = json.dumps(total)

#     # w = json_data + t

#     # json_data += ','+str({'total': 1})
#     # print(w)


#     # res = db.session.execute(db.select(Device)).scalar()

#     # print(res.dev_eui)










#     # Need two in order to paginate CORRECTLY, 1 one needed once user indictesat teeeh org assocaiteed
#     # role = db.session.execute(db.select(OrgAccount.r_id).where(OrgAccount.a_id == 1).where(OrgAccount.o_id == 2)).scalar()

#     # page = db.paginate(db.select(Organization).join(Organization.orgAccounts).filter(OrgAccount.a_id == 1), page= 1, per_page= 5)

#     # print('role: ', role)
#     # print(page.items)
#     # res = {
#     # 'total': page.pages,
#     # 'list': [
#     # {
#     # 'o_id' : p.id,
#     # 'name': p.name,
#     # 'description': p.description
#     # } for p in page.items
#     # ]
#     # }

#     # print(res)






#     #move on to org appliactions #########################################################################
#     #create an app associated with an organization








#     # first create an application

#     # app = Application(name='myapp', description= 'oidk')

#     # db.session.add(app)
#     # db.session.commit()





#     # for creating a orgApp
#     # ap = db.session.execute(db.select(Application).where(Application.name == 'myapp')).scalar()

#     # organ = db.session.execute(db.select(Organization).join(OrgAccount.org).where(OrgAccount.a_id == 1).where(Organization.id == 5)).scalar()
#     # # print('org', organ.name)
#     # print(ap.name)

#     # oApp = OrgApplication(app = ap, org=organ)
#     # # # # print('oApp', oApp.org)
#     # db.session.add(oApp)
#     # db.session.commit()
#     ####################################

#     # select statement with org application

#     # res = db.session.execute(db.select(OrgApplication).where(OrgApplication.o_id == 1)).scalar()
#     # res = db.session.execute(db.select(OrgApplication).where(OrgApplication.o_id == 1)).scalars()

#     # print(res.all())




#     # this is for find the an organizations applications ###########################
#     # page = db.paginate(db.select(OrgApplication).where(OrgApplication.o_id == 1), page= 1, per_page= 10)

#     # j = {
#     # 'o_id': 1,
#     # 'totalPages': page.pages,
#     # 'list':[
#     # {
#     # 'appId': p.id,
#     # 'description': p.description
#     # } for p in page.items
#     # ]
#     # }

#     # print(j)







#     # ap = db.session.execute(db.select(Application).join(Application.orgs).where(OrgApplication.o_id == 5)).scalar()

#     # p = db.session.execute(db.select(Application)).scalar()

#     # print(ap.name)

#     # page = db.paginate(db.select(Application).join(Application.orgs).where(OrgApplication.o_id == 5), page= 1, per_page= 5)

#     # # print(page.items) #doesnt work if not specified the object attributes to expose
#     # res = {
#     # 'totalPages': page.pages,
#     # 'list': [
#     # {
#     # 'app_id' : p.id,
#     # 'name': p.name,
#     # 'description': p.description
#     # } for p in page.items
#     # ]
#     # }

#     # print(res)


#     ###############################################

#     # adding a device to applciation needs a join eui, app key and dev eui



#     # res = db.session.execute(db.select(Application).join(Application.orgs).where(OrgApplication.o_id == 5)).scalar()

#     # print('app',res.name)


#     # dev = db.session.execute(db.select(Device).where(Device.dev_eui == 'A3')).scalar()
#     # print('dev', dev.dev_eui)



#     # appsensor = AppSensors(app= res, dev_eui= dev.dev_eui)

#     # db.session.add(appsensor)
#     # db.session.commit()





#     # paginate devs in a app

#     # res = db.session.execute(db.select(AppSensors).where(AppSensors.app_id == 1)).scalars()

#     # print(res.all())
#     # for i in res:
#     # print(i.dev_eui)



#     # print('id', db.session.execute(db.select(Application).join(Application.orgs).where(OrgApplication.o_id ==1)).scalars())


#     # page = db.session.execute(db.select(AppSensors).where(AppSensors.app_id == 1)).scalars()

#     #     # # print(page.items) #doesnt work if not specified the object attributes to expose
#     # res = {
#     # # 'totalPages': page.pages,
#     # 'list': [
#     #     {
#     #         'app_id': p.app_id,
#     #         'name': p.dev_name,
#     #         'dev': p.dev_eui

#     #     } for p in page.all()
#     # ]
#     # }

#     # print(res)











































#     page = db.session.execute(db.select(Account).join(Account.orgAccounts).where((OrgAccount.r_id == 2) | (OrgAccount.r_id == 3))).scalars()

#     # # print(page.items) #doesnt work if not specified the object attributes to expose
#     res = {
#     # 'totalPages': page.pages,
#     'list': [
#     {
#     'a_id' : p.id,
#     'name': p.name

#     } for p in page.all()
#     ]
#     }

#     j = json.dumps(res)

#     print(j)











#     # changed implmetation for making JSON responses



#     # page = db.session.execute(db.select(Application).join(Application.orgs).where(OrgApplication.app_id == 1)).scalars()

#     # # # print(page.items) #doesnt work if not specified the object attributes to expose
#     # res = {
#     # # 'totalPages': page.pages,
#     # 'list': [
#     # {
#     # 'app_id' : p.id,
#     # 'name': p.name
#     # } for p in page.all()
#     # ]
#     # }

#     # j = json.dumps(res)

    




#     # app = db.session.execute(db.select(Application).where(Application.id == 1)).scalar()

#     # dev = AppSenseo()

##############################################################

    # print(db.session.execute(db.select(Device.dev_eui)).scalars().all())

    # creating a appliction independent of an org for testing 

    # myApp = Application(name= 'myApp', description= 'idk wwhat to put here')
    # db.session.add(myApp)
    # db.session.commit()




    # for adding devices to a application

    # app = db.session.execute(db.select(Application).where(Application.id == 1)).scalar()

    # appSensor = AppSensors(app_id = app.id, dev_name='myDevice', dev_eui= 'A1')
    # db.session.add(appSensor)
    # db.session.commit()






    # check if a device is  in the  lab Snesor json 

    # print(db.session.execute(db.select(Device).where(Device.dev_eui == 'A1')).scalar().dev_eui)

    # if (db.session.execute(db.select(Device).where(Device.dev_eui == 'A2')).scalar() is not None ):
        
    #     app = db.session.execute(db.select(Application).where(Application.id == 1)).scalar()

    #     appSensor = AppSensors(app_id = app.id, dev_name='myDevice', dev_eui= 'A2')
    #     db.session.add(appSensor)
    #     db.session.commit()




    # page = db.session.execute(db.select(AppSensors).where(AppSensors.app_id == 10)).scalars()

    # res = {
    #     'list': [
    #         {
    #             'app_id': p.app_id,
    #             'name': p.dev_name,
    #             'dev': p.dev_eui

    #         } for p in page.all()
    #     ]
    # }

    # j = json.dumps(res)

    # print('Devices are, j')




    # page = db.session.execute(db.select(Organization).where(Organization.id == 10)).scalar()

    # print(page.name)



    # print(  'dev test',  (db.session.execute(db.select(Device)).scalars()).all())


    # how to select distinct device availbe


    # # db.session.execute()
    # page = db.session.execute(db.select(AppSensors.dev_eui).where(AppSensors.app_id == 10).where(AppSensors.dev_name == 'myDevice')).scalar()
    # print('deve eui', page)





    # # pull all user associated with an organization

    # page = db.session.execute(db.select(Account).join(Account.orgAccounts).where(OrgAccount.o_id == 10))






# if __name__ == '__main__':
with app.app_context():
# for creating db
    # db.reflect()
    db.create_all()
    # print(db.session.execute(db.select(Device.dev_eui)).scalars().all())

    # TokenBlockList.__table__.drop(db.engine)

    # OrgAccount.__table__.drop(db.engine)

    # Account.__table__.drop(db.engine)

    # AppSensors.__table__.drop(db.engine)

    # OrgApplication.__table__.drop(db.engine)

    # Application.__table__.drop(db.engine)

    # Organization.__table__.drop(db.engine)

# #fro deleting
    # db.reflect()
    # db.drop_all()

    # func()
# # pass


# class Device(Base):
# __table__ = db.metadata.tables['device']

# appDevices: Mapped[List['AppSensors']] = relationship(back_populates= 'devices')


# with app.app_context():
    # db.create_all()
    # func()
    # pass