### development settings

DEBUG= True
SECRET_KEY= 'm(1-yb!eg34f*ve_w$z$#*8e=_fd@qte8yjjpgk+5andsoonPk'

STATIC_URL= 'http://broke/media/'
MEDIA_URL= STATIC_URL
ADMIN_MEDIA_PREFIX = '%sadmin_media/'% (MEDIA_URL,)

# db
DATABASE_ENGINE = 'mysql'
DATABASE_NAME = 'broke'
DATABASE_USER = 'broke_user'
DATABASE_PASSWORD = 'br0k3Buzzword'
