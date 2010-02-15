from datetime import datetime

from django.db import models
from django.contrib.auth.models import User


class Entry(models.Model):
	title= models.CharField(max_length= 200)
	body= models.TextField()
	
	pub_date= models.DateField(default= datetime.now())
	
	def __unicode__(self):
		return '%s' % (self.title,)
	__unicode__.short_description= 'Short description'

	class Meta:
		verbose_name = 'entry'
		verbose_name_plural = 'entries'
