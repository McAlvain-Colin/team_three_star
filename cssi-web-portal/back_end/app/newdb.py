from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, types, Text, LargeBinary, ForeignKey, select

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, registry, relationship
from typing_extensions import Annotated
from typing import List

from flask import Flask, jsonify, abort, Response, make_response


#db things###########################
str_320 = Annotated[str, 320]


class Base(DeclarativeBase):
    registry = registry(type_annotation_map={
        str_320: String(320)

    })
    pass

db = SQLAlchemy(model_class=Base)


app = Flask(__name__)


app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Locomexican22@localhost/postgres'
db.init_app(app)


# with app.app_context():
#     # db.create_all()
#     # db.drop_all()
#     db.reflect()


# class Device(Base):
#     __table__ = db.metadata.tables['device']

    # dev_eui: Mapped[str] = mapped_column(Text, primary_key= True)

    # reading: Mapped[int] = mapped_column(unique= False)

    # appDevices: Mapped[List['AppSensors']] = relationship(back_populates= 'device')




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

    orgApps: Mapped[List['OrgApplication']] = relationship(back_populates='org')


    def __init__(self, name, desc, active):
        self.name = name
        self.description = desc
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



class Application(Base):
    __tablename__ = 'Application'

    id: Mapped[int] = mapped_column(primary_key= True)
    name : Mapped[str] = mapped_column(nullable= True)
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
        return f'orgApp {self.id} {self.description}'

    


class AppSensors(Base):
    __tablename__ = 'AppSensors'

    app_id: Mapped[int] = mapped_column(ForeignKey('Application.id'))
    app: Mapped['Application'] = relationship(back_populates= 'appSensors')

    # dev_eui needs to have the table name as stored in postgreSQL
    dev_eui: Mapped[str] = mapped_column(Text, ForeignKey("device.dev_eui"), primary_key= True)
    devices: Mapped['Device'] = relationship(back_populates= 'appDevices')

   
with app.app_context():
    # for creating db 
    db.reflect()
    


class Device(Base):
    __table__ = db.metadata.tables['device']

    appDevices: Mapped[List['AppSensors']] = relationship(back_populates= 'devices')


def func():


    # o = db.session.execute(db.select(Organization).join(Organization.orgAccounts).filter_by(a_id = 1))

    # print(o)
    # for creating a account
    # email ='hasd@gmail.com'
    # hashed = 'lol'
    # hashed = hashed.encode('utf-8')
    # newUser = Account(email, hashed, False, True )
    # db.session.add(newUser)
    # db.session.commit()

    # # # for creating a org
    # org = Organization('5org', 'this is my first org', True)
    # db.session.add(org)
    # db.session.commit()

    # org = Organization('6org', 'this is my first org', True)
    # db.session.add(org)
    # db.session.commit()

    # org = Organization('7org', 'this is my first org', True)
    # db.session.add(org)
    # db.session.commit()

    # org = Organization('8org', 'this is my first org', True)
    # db.session.add(org)
    # db.session.commit()

    # org = Organization('9org', 'this is my first org', True)
    # db.session.add(org)
    # db.session.commit()

    # org = Organization('10org', 'this is my first org', True)
    # db.session.add(org)
    # db.session.commit()


    # For adding to orgAccounts
    # newUser = db.session.execute(db.select(Account).filter_by(id = 1)).scalar()
    # newOrg = db.session.execute(db.select(Organization).filter_by(id = 3)).scalar()

    # # # newOrg = Organization('lol', 'testintg')

    # # # #link the account with the org
    # for i in range(1,7):
    #     orgAcc = OrgAccount(a_id= 1, o_id= i, r_id = i % 4)

    # # # orgAcc = OrgAccount(a_id= newUser.id, o_id= newOrg.id, r_id = 2)


    #     db.session.add(orgAcc)
    #     db.session.commit()
    # try:

    #     page = db.paginate(db.select(Account).filter_by(id = 1), page=1, per_page=5)
    #     j = [
    #         {
    #             'id': p.id,
    #             'email': p.email
    #         } for p in page.items
    #     ]
    #     print(j)
    # except Exception as e:
    #     print(str(e))
    #     k = make_response({'error': str(e)}, 404)

    #     print(k)

    # select(Organization).join(Organization.orgAccounts)
   
    # page = db.paginate(db.select(Organization).filter_by(a_id = 1), page= 1, per_page= 10)
    # res = {'total': page.pages,
    #        'list': [
    #                 {
    #                     'role': 1,

    #                     'name': p.name,
    #                     'description': p.description
    #                 } for p in page.items
    #                 ]
    # }



    # page = db.paginate(db.select(Organization).filter_by(id = 1)).pages




    # THIS IS BETTER VERSION OF WHAT TO DO with orhg info and org account role id
    # o = db.session.execute(db.select(OrgAccount.r_id, Organization).join_from(Organization, OrgAccount))


    # print(o.all())
    # print(o.all())
    # for i in o.all():
    #     print('rid:', i.r_id)
    #     print('org name:', i.Organization.name)



    # this works forr joins ACTUALY!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    # o = db.session.execute(db.select(OrgAccount.r_id, Organization).join(Organization.orgAccounts).filter_by(a_id = 1))

    # print(o.all())
    # # print(o.all())
    # for i in o.all():
    #     print('rid:', i.r_id)
    #     print('org name:', i.Organization.name)




    # page = db.paginate(db.select(OrgAccount.r_id, Organization).join(OrgAccount.org).filter_by(a_id = 1), per_page = 1)

    # res = {'total': page.pages,
    #        'list': [
    #                 {
    #                     'role': 1,

    #                     'name': p.name,
    #                     'description': p.description
    #                 } for p in page.items
    #                 ]
    # }


    
    # page = db.paginate(db.select(Organization).join(Organization.orgAccounts).filter_by(a_id = 1), per_page = 1)

    # print(page.items)

    # # print(res.items)

    ############################################################
    # working for reading orgs associated with an account org - orgAccount working

    # page = db.paginate(db.select(Organization).join(Organization.orgAccounts).filter_by(a_id = 1), page= 1, per_page= 10)
    
    # for i in page.items:
    #     print(i.r_id)
    
    # res = {'total': page.pages,
    #        'list': [
    #                 {
    #                    # 'role': p.r_id
    #                     'o_id' : p.id,
    #                     'name': p.name,
    #                     'description': p.description
    #                 } for p in page.items
    #             ]
    # }
    

    # print(res)


    ####################################################################
    # get org with id = 1 
    # org = db.session.execute(db.select(Organization).filter_by(id = 1)).scalar()


    # # # AppSensors()
    # oApp = OrgApplication(description='for mah testing', o_id= org.id) 

    # db.session.add(oApp)
    # db.sesson.commit()



    # print(res)

    # json_data = json.dumps(res)
    # t = json.dumps(total)

    # w = json_data + t

    # json_data += ','+str({'total': 1})
    # print(w)


    # res = db.session.execute(db.select(Device)).scalar()

    # print(res.dev_eui)










    # Need two in order to paginate CORRECTLY, 1 one needed once user indictesat teeeh org assocaiteed
        
    # role = db.session.execute(db.select(OrgAccount.r_id).where(OrgAccount.a_id == 1).where(OrgAccount.o_id == 2)).scalar()

    # page = db.paginate(db.select(Organization).join(Organization.orgAccounts).filter(OrgAccount.a_id == 1), page= 1, per_page= 5)

    # print('role: ', role)
    # print(page.items)
    # res = {
    #         'total': page.pages,
    #         'list': [
    #                 {
    #                     'o_id' : p.id,
    #                     'name': p.name,
    #                     'description': p.description
    #                 } for p in page.items
    #             ]
    # }

    # print(res)






    #move on to org appliactions #########################################################################
    #create an app associated with an organization








    # first create an application

    # app = Application(name='myapp', description= 'oidk')

    # db.session.add(app)
    # db.session.commit() 





    # for creating a orgApp   
    # ap = db.session.execute(db.select(Application).where(Application.name == 'myapp')).scalar()

    # organ = db.session.execute(db.select(Organization).join(OrgAccount.org).where(OrgAccount.a_id == 1).where(Organization.id == 5)).scalar()
    # # print('org', organ.name)
    # print(ap.name)

    # oApp = OrgApplication(app = ap,  org=organ)
    # # # # print('oApp', oApp.org)
    # db.session.add(oApp)
    # db.session.commit()
    ####################################

    # select statement with org application   

    # res = db.session.execute(db.select(OrgApplication).where(OrgApplication.o_id == 1)).scalar() 
    # res = db.session.execute(db.select(OrgApplication).where(OrgApplication.o_id == 1)).scalars() 

    # print(res.all())




    # this is for find the an organizations applications ###########################
    # page = db.paginate(db.select(OrgApplication).where(OrgApplication.o_id == 1), page= 1, per_page= 10)

    # j = {
    #     'o_id': 1,
    #     'totalPages': page.pages,
    #     'list':[
    #         {
    #             'appId': p.id,
    #             'description': p.description
    #         } for p in page.items
    #     ]
        
    # }

    # print(j)







 
    # ap = db.session.execute(db.select(Application).join(Application.orgs).where(OrgApplication.o_id == 5)).scalar()
 

    # p = db.session.execute(db.select(Application)).scalar()

    # print(ap.name)

    # page = db.paginate(db.select(Application).join(Application.orgs).where(OrgApplication.o_id == 5), page= 1, per_page= 5)

    # # print(page.items) #doesnt work if not specified the object attributes to expose
    # res = {
    #         'totalPages': page.pages,
    #         'list': [
    #                 {
    #                     'app_id' : p.id,
    #                     'name': p.name,
    #                     'description': p.description
    #                 } for p in page.items
    #             ]
    # }

    # print(res)


    ###############################################

    # adding a device to applciation needs a join eui, app key and dev eui 



 
    # res = db.session.execute(db.select(Application).join(Application.orgs).where(OrgApplication.o_id == 5)).scalar()

    # print('app',res.name)


    # dev = db.session.execute(db.select(Device).where(Device.dev_eui == 'A3')).scalar()
    # print('dev', dev.dev_eui)



    # appsensor = AppSensors(app= res, dev_eui= dev.dev_eui)

    # db.session.add(appsensor)
    # db.session.commit()





    # paginate devs in a app

    # res = db.session.execute(db.select(AppSensors).where(AppSensors.app_id == 1)).scalars()

    # print(res.all())
    # for i in res:
    #     print(i.dev_eui)


    # page = db.paginate(db.select(AppSensors).where(AppSensors.app_id == 1), page= 1, per_page= 5)

    # # print(page.items) #doesnt work if not specified the object attributes to expose
    # res = {
    #         'totalPages': page.pages,
    #         'list': [
    #                 {
    #                     'app_id' : p.app_id,
    #                     'name': p.dev_eui
    #                 } for p in page.items
    #             ]
    # }

    # print(res)



    ##############################################################

    page = db.session.execute(db.select(Organization).join(Organization.orgAccounts).where(OrgAccount.a_id == 1).where(OrgAccount.r_id == 2)).scalars()

    # print(page.all())
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












# if __name__ == '__main__':
# with app.app_context():
#     # for creating db 
#     db.reflect()
#     # db.create_all()

#     #fro deleting
#     # db.reflect()
#     # db.drop_all()

#     # func()
#     # pass
    


# class Device(Base):
#     __table__ = db.metadata.tables['device']

#     appDevices: Mapped[List['AppSensors']] = relationship(back_populates= 'devices')

    

with app.app_context():
    func()


