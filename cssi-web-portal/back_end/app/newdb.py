from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, types, text, LargeBinary, ForeignKey

from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, registry, relationship 
from typing_extensions import Annotated
from typing import List

from flask import Flask

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
    password:Mapped[bytes] = mapped_column(types.LargeBinary(), unique= True)
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

    


def func():
    # for creating a account
    email ='lo'
    # hashed = 'h'
    # hashed = hashed.encode('utf-8')
    # newUser = Account(email, hashed, False)
    # db.session.add(newUser)
    # db.session.commit()

    ## for creating a org
    # org = Organization('myOrg')
    # db.session.add(org)
    # db.session.commit()


    # For adding to orgAccounts
    newUser = db.session.execute(db.select(Account).filter_by(email = email)).scalar()

    newOrg = db.session.execute(db.select(Organization).filter_by(name = 'myOrg')).scalar()

    orgacc = OrgAccount(account= newUser, org= newOrg)

    db.session.add(orgacc)
    db.session.commit()


if __name__ == '__main__':
    with app.app_context():
        # db.create_all()
        func()