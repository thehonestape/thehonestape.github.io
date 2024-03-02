---
featured-image: /assets/img/bloompop/bloompop.jpg
categories: [Design]
feed: show
date : 08-01-2023
author: Abraham Garcia Flores
---

I worked with the founders of Bloompop to help them launch "The Etsy for Florists". <strong>I established a design system from zero and worked with the technical founder to design a custom e-commerce platform</strong>. As an early advocate for "designing in the browser", I worked with the founder to develop a workflow that involved rapid iteration. We abandoned typical design tools, and I worked directly with a whiteboard, Node.js, and Git. 

I continued to work with the Bloompop post-launch on marketing and campaign creative direction and later to extend the brand architecture to include a new product called "Freshcut" that assiste  florists in sourcing flowers directly from growers.

<!--Assign page.title to a var-->
{% assign thisTitle = page.title | downcase | replace: ' ', '-' %}
<div class="gallery">
  {% for file in site.static_files %}
       {% if file.path contains 'img/bloompop' and file.extname == '.jpg' %}
            <img src="{{ file.path }}" alt="Gallery Image" />
       {% endif %} 
     {% endfor %}
</div>