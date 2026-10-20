---
layout: page
title: "Sports Radio Stations"
description: "Every sports radio station you can stream on FreeFanRadio.ca, by province, with one-tap live play."
permalink: /sports/
---
{%- assign stations = site.stations | where_exp: "s", "s.hidden != true" -%}
{%- assign provinces = "AB:Alberta,BC:British Columbia,MB:Manitoba,NB:New Brunswick,NL:Newfoundland and Labrador,NS:Nova Scotia,ON:Ontario,PE:Prince Edward Island,QC:Quebec,SK:Saskatchewan" | split: "," -%}
{% for p in provinces %}
{%- assign code = p | split: ":" | first -%}
{%- assign label = p | split: ":" | last -%}
{%- assign suffix = ", " | append: code -%}
{%- assign in_province = stations | where_exp: "s", "s.location contains suffix" | sort: "title" -%}
{%- if in_province.size > 0 %}
<section class="section">
    <h2 class="section-title">{{ label }}</h2>
    <ul class="row-list">
        {%- for s in in_province %}
        <li>
            <a class="row-main" href="{{ s.url | relative_url }}"><span class="row-title">{{ s.title }}</span><span class="row-sub">{{ s.frequency }} · {{ s.location }}</span></a>
            <button type="button" class="play-circle play-station-btn" data-station-id="{{ s.station_id }}" aria-label="Play {{ s.title }}">
                <svg class="i-play" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l13-7.5z"/></svg>
                <svg class="i-pause" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>
            </button>
        </li>
        {%- endfor %}
    </ul>
</section>
{%- endif %}
{% endfor %}

<p class="muted small section">Looking for a specific team? <a href="{{ '/teams/' | relative_url }}">Find your team</a>.</p>
