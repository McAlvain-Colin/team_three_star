from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, types, Text, LargeBinary, ForeignKey, select

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, registry, relationship
from typing_extensions import Annotated
from typing import List

from flask import Flask, jsonify, abort, Response, make_response



import json
from dataclasses import dataclass


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
        return f'id = {self.id}, email = {self.email}'
   

class Organization(Base):
    __tablename__ = "Organization"

    id:Mapped[int] = mapped_column(primary_key= True) #implicitly Serail datatype in Postgres  db
    name: Mapped[str] = mapped_column(nullable= False)
    description:Mapped[str] = mapped_column(nullable= True)

    orgAccounts: Mapped[List['OrgAccount']] = relationship(back_populates='org')

    orgApps: Mapped[List['OrgApplication']] = relationship(back_populates='org')


    def __init__(self, name, desc):
        self.name = name
        self.description = desc

    def __repr__(self):
        return f'organization: {self.name}'
   

class OrgAccount(Base):
    __tablename__ = 'OrgAccount'

    id:Mapped[int] = mapped_column(primary_key= True) #implicitly Serail datatype in Postgres  db

    a_id: Mapped[int] = mapped_column(ForeignKey('Account.id'))
    account: Mapped['Account'] = relationship(back_populates='orgAccounts')

    o_id: Mapped[int] = mapped_column(ForeignKey('Organization.id'))
    org: Mapped['Organization'] = relationship(back_populates='orgAccounts')





class OrgApplication(Base):
    __tablename__ = 'OrgApplication'

    id: Mapped [int] = mapped_column(primary_key = True)
    appSensors: Mapped[List['AppSensors']] = relationship(back_populates='OrgApp')

    #org apps

    o_id: Mapped[int] = mapped_column(ForeignKey('Organization.id'))
    org: Mapped['Organization'] = relationship(back_populates='orgApps') 

    # dev_eui: Mapped[str] = mapped_column(ForeignKey('Devices.dev_eui'))
    # device: Mapped['Device'] = mapped_column(back_populates= 'appDevice')


    


class AppSensors(Base):
    __tablename__ = 'AppSensors'

    app_id: Mapped[int] = mapped_column(ForeignKey('OrgApplication.id'))
    orgApp: Mapped['OrgApplication'] = relationship(back_populates= 'appSensors')

    dev_eui: Mapped[str] = mapped_column(Text, ForeignKey('Device.dev_eui'))
    device: Mapped['Device'] = relationship(back_populates= 'appDevices')



# class Device(Base):
#     __table__ = db.metadata.tables['devices']
   


def func():
    # for creating a account
    # email ='how'
    # hashed = 'lol'
    # hashed = hashed.encode('utf-8')
    # newUser = Account(email, hashed, False)
    # db.session.add(newUser)
    # db.session.commit()

    # for creating a org
    # org = Organization('3Org', 'this is my first org')
    # db.session.add(org)
    # db.session.commit()


    # For adding to orgAccounts
    # newUser = db.session.execute(db.select(Account).filter_by(id = 1)).scalar()

    # newOrg = Organization('lol', 'testintg')

    # #link the account with the org
    # orgAcc = OrgAccount(account= newUser, org= newOrg)

    # db.session.add(newOrg)
    # db.session.commit()
    # db.session.add(orgAcc)
    # db.session.commit()
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
    #                     'name': p.name,
    #                     'description': p.description
    #                 } for p in page.items
    #                 ]
    # }


    # page = db.paginate(db.select(Organization).filter_by(id = 1)).pages

    # o = db.session.execute(db.select(Organization).join(Organization.orgAccounts).filter_by(a_id = 1)).scalars()

    # page = db.paginate(db.select(Organization).join(Organization.orgAccounts).filter_by(a_id = 1), per_page = 1)


    # # print(res.items)

    # # page = db.paginate(db.select(Organization).filter_by(a_id = 1), page= 1, per_page= 10)
    # res = {'total': page.pages,
    #        'list': [
    #                 {
    #                     'name': p.name,
    #                     'description': p.description
    #                 } for p in page.items
    #                 ]
    # }

    # print(res)



    # print(res)

    # json_data = json.dumps(res)
    # t = json.dumps(total)

    # w = json_data + t

    # json_data += ','+str({'total': 1})
    # print(w)

    res = db.session.execute(db.select(Device)).scalar()






# if __name__ == '__main__':
with app.app_context():
    # db.create_all()
    # db.drop_all()
    db.reflect()


class Device(Base):
    __table__ = db.metadata.tables['devices']

    appDevices: Mapped[List['AppSensors']] = relationship(back_populates= 'device')

    

with app.app_context():
    func()


