# from data_parser import sensor_data_list, dictionary_list
import psycopg2
from psycopg2 import pool
# from logging import Logger
import logging

logging.basicConfig(filename='example.log', encoding='utf-8', level=logging.DEBUG)

log = logging.getLogger(__name__)

db_pool = pool.SimpleConnectionPool(
    minconn=1,          # minimum number of connections to keep open
    maxconn=50,         # maximum number of connections to keep open
    dbname="postgres",  # Database name
    user="postgres",  # Database username
    password="cssiwebportal2024",  # Database password
    host="0.0.0.0"  # IP addresswh
)
def get_db_connection():
    try:
        return db_pool.getconn()
    except Exception as e:
        log.error(f'Failed to get database connection: {e}')
        return None

def close_db_connection(conn):
    if conn:
        db_pool.putconn(conn)

def create_record(table, data):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if conn is None:
            return  # Early return if the connection was not obtained
        cursor = conn.cursor()
        placeholders = ', '.join(['%s'] * len(data))
        columns = ', '.join(data.keys())
        sql = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        cursor.execute(sql, list(data.values()))
        conn.commit()
    except Exception as e:
        log.error(f'Failed to create record: {e}')
        if conn:
            conn.rollback()
    finally:
        if cursor:
            cursor.close()
        close_db_connection(conn)

def read_records(table, conditions=None, dev_eui=None):
    conn = None
    cursor = None
    print(table)
    try:
        conn = get_db_connection()
        if conn is None:
            return  # Early return if the connection was not obtained
        cursor = conn.cursor()
        sql = f"SELECT * FROM {table}"
        # print(sql)
        if conditions == 'distinct':
            sql = f"SELECT DISTINCT dev_eui FROM {table}"
            print(sql)
            cursor.execute(sql)
        elif conditions == 'payload':
            sql = f"SELECT time, payload FROM {table} WHERE dev_eui = '{dev_eui}' ORDER BY time DESC LIMIT 100"
            print(sql)
            cursor.execute(sql)
        elif conditions == 'payloadStats':
            sql = f"SELECT payload FROM {table} WHERE dev_eui = '{dev_eui}' ORDER BY time DESC LIMIT 100"
            print(sql)
            cursor.execute(sql)
        elif conditions == 'metadataStats':
            sql = f"SELECT metadata FROM {table} WHERE dev_eui = '{dev_eui}' ORDER BY time DESC LIMIT 100"
            print(sql)
            cursor.execute(sql)
        elif conditions == 'metadata':
            sql = f"SELECT time, metadata FROM {table} WHERE dev_eui = '{dev_eui}' ORDER BY time DESC LIMIT 100"
            print(sql)
            cursor.execute(sql)
        elif conditions == 'location':
            sql = f"SELECT * FROM {table}"
            print(sql)
            cursor.execute(sql)
        elif condition == 'annotation':
            sql = f"SELECT annotation FROM {table} WHERE dev_eui = '{dev_eui}'"
            print(sql)
            cursor.execute(sql)
        elif conditions:
            sql += " WHERE " + conditions + ' ORDER BY time DESC LIMIT 100' 
            print(sql)
            cursor.execute(sql)
        else:
            sql += ' ORDER BY time DESC LIMIT 100'
            print(sql)
            cursor.execute(sql)
        records = cursor.fetchall()
        # print(records)
        return records
    except Exception as e:
        log.error(f'Failed to read records: {e}')
        return None
    finally:
        if cursor:
            cursor.close()
        close_db_connection(conn)

def update_record(table, conditions, dev_eui, data):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if conn is None:
            return  # Early return if the connection was not obtained
        cursor = conn.cursor()
        # print(sql)
        if conditions == 'annotation': 
            sql = f"UPDATE {table} SET annotation = {data} WHERE dev_eui = {dev_eui}""
            print(sql)
            cursor.execute(sql)
        else:
            conn = get_db_connection()
            if conn is None:
                return  # Early return if the connection was not obtained
            cursor = conn.cursor()
            set_clause = ', '.join([f"{k} = %s" for k in data.keys()])
            condition_clause = ' AND '.join([f"{k} = %s" for k in conditions.keys()])
            sql = f"UPDATE {table} SET {set_clause} WHERE {condition_clause}"
            cursor.execute(sql, list(data.values()) + list(conditions.values()))
            conn.commit()
            records = cursor.fetchall()
            # print(records)
        return records    
    except Exception as e:
        log.error(f'Failed to update record: {e}')
        if conn:
            conn.rollback()
    finally:
        if cursor:
            cursor.close()
        close_db_connection(conn)

def delete_record(table, conditions):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if conn is None:
            return  # Early return if the connection was not obtained
        cursor = conn.cursor()
        condition_clause = ' AND '.join([f"{k} = %s" for k in conditions.keys()])
        sql = f"DELETE FROM {table} WHERE {condition_clause}"
        cursor.execute(sql, list(conditions.values()))
        conn.commit()
    except Exception as e:
        log.error(f'Failed to delete record: {e}')
        if conn:
            conn.rollback()
    finally:
        if cursor:
            cursor.close()
        close_db_connection(conn)

def start_transaction():
    conn = get_db_connection()
    if conn:
        conn.autocommit = False
    return conn

def commit_transaction(conn):
    if conn:
        try:
            conn.commit()
        finally:
            close_db_connection(conn)

def rollback_transaction(conn):
    if conn:
        try:
            conn.rollback()
        finally:
            close_db_connection(conn)
