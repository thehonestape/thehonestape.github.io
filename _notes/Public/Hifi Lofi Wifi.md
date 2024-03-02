---
featured-image: /assets/img/thesis/hilowi-9.jpg
categories: [Design]
feed: show
date : 08-01-2023
author: Abraham Garcia Flores
---

My gradaute school thesis, HifiLofiWifi was an interactive installation that employed a series of analog and digital MIDI controlloers which controlled a series of repeating shapes and sets of shapes, forming patterns and coming together in an immersion of sound and color. 

The exhibition also included several sound reactive images displayed as individual pieces on several vintage Apple iMacs. 

<!--Assign page.title to a var-->
{% assign thisTitle = page.title | downcase | replace: ' ', '-' %}
<div class="gallery">
  {% for file in site.static_files %}
       {% if file.path contains 'img/thesis' and file.extname == '.jpg' %}
            <img src="{{ file.path }}" alt="Gallery Image" />
       {% endif %} 
     {% endfor %}
</div>