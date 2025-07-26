---
layout: page
title: "Sports Radio Stations"
description: "Complete listing of Canadian sports radio stations available for streaming on FreeFanRadio.ca"
permalink: /sports/
---

<!-- Group stations by province -->
{% assign sports_stations = site.stations | where: "category", "sports" %}

<!-- Create arrays for each province -->
{% assign ab_stations = sports_stations | where_exp: "station", "station.location contains 'AB'" | sort: "location" %}
{% assign bc_stations = sports_stations | where_exp: "station", "station.location contains 'BC'" | sort: "location" %}
{% assign mb_stations = sports_stations | where_exp: "station", "station.location contains 'MB'" | sort: "location" %}
{% assign nb_stations = sports_stations | where_exp: "station", "station.location contains 'NB'" | sort: "location" %}
{% assign nl_stations = sports_stations | where_exp: "station", "station.location contains 'NL'" | sort: "location" %}
{% assign ns_stations = sports_stations | where_exp: "station", "station.location contains 'NS'" | sort: "location" %}
{% assign on_stations = sports_stations | where_exp: "station", "station.location contains 'ON'" | sort: "location" %}
{% assign pe_stations = sports_stations | where_exp: "station", "station.location contains 'PE'" | sort: "location" %}
{% assign qc_stations = sports_stations | where_exp: "station", "station.location contains 'QC'" | sort: "location" %}
{% assign sk_stations = sports_stations | where_exp: "station", "station.location contains 'SK'" | sort: "location" %}

<!-- Display Alberta stations -->
{% if ab_stations.size > 0 %}
<div class="province-section">
    <h2 class="province-header">Alberta</h2>
    <div class="stations-grid">
        {% for station in ab_stations %}
            {% if station.hidden != true %}
            {{station.hidden}}
            <div class="station-card">
                <div class="station-header">
                    <div class="station-info">
                        <h3><a href="{{ station.url }}">{{ station.title }}</a></h3>
                        <p>{{ station.description }}</p>
                        <div class="station-meta">
                            <span class="frequency">{{ station.frequency }}</span>
                            <span class="location">{{ station.location }}</span>
                            <span class="genre">{{ station.genre }}</span>
                        </div>
                    </div>
                    <div class="station-actions">
                        <button class="play-station-btn" data-stream="{{ station.stream_url }}" data-name="{{ station.title }}">
                            <i class="fas fa-play"></i>
                            Play Live
                        </button>
                    </div>
                </div>
            </div>        
            {% endif %}
        {% endfor %}
    </div>
</div>
{% endif %}

<!-- Display British Columbia stations -->
{% if bc_stations.size > 0 %}
<div class="province-section">
    <h2 class="province-header">British Columbia</h2>
    <div class="stations-grid">
        {% for station in bc_stations %}
            {% if station.hidden != true %}
            <div class="station-card">
                <div class="station-header">
                    <div class="station-info">
                        <h3><a href="{{ station.url }}">{{ station.title }}</a></h3>
                        <p>{{ station.description }}</p>
                        <div class="station-meta">
                            <span class="frequency">{{ station.frequency }}</span>
                            <span class="location">{{ station.location }}</span>
                            <span class="genre">{{ station.genre }}</span>
                        </div>
                    </div>
                    <div class="station-actions">
                        <button class="play-station-btn" data-stream="{{ station.stream_url }}" data-name="{{ station.title }}">
                            <i class="fas fa-play"></i>
                            Play Live
                        </button>
                    </div>
                </div>
            </div>
            {% endif %}
        {% endfor %}
    </div>
</div>
{% endif %}

<!-- Display Manitoba stations -->
{% if mb_stations.size > 0 %}
<div class="province-section">
    <h2 class="province-header">Manitoba</h2>
    <div class="stations-grid">
        {% for station in mb_stations %}
        {% if station.hidden != true %}
        <div class="station-card">
            <div class="station-header">
                <div class="station-info">
                    <h3><a href="{{ station.url }}">{{ station.title }}</a></h3>
                    <p>{{ station.description }}</p>
                    <div class="station-meta">
                        <span class="frequency">{{ station.frequency }}</span>
                        <span class="location">{{ station.location }}</span>
                        <span class="genre">{{ station.genre }}</span>
                    </div>
                </div>
                <div class="station-actions">
                    <button class="play-station-btn" data-stream="{{ station.stream_url }}" data-name="{{ station.title }}">
                        <i class="fas fa-play"></i>
                        Play Live
                    </button>
                </div>
            </div>
        </div>
        {% endif %}
        {% endfor %}
    </div>
</div>
{% endif %}

<!-- Display New Brunswick stations -->
{% if nb_stations.size > 0 %}
<div class="province-section">
    <h2 class="province-header">New Brunswick</h2>
    <div class="stations-grid">
        {% for station in nb_stations %}
            {% if station.hidden != true %}
            <div class="station-card">
                <div class="station-header">
                    <div class="station-info">
                        <h3><a href="{{ station.url }}">{{ station.title }}</a></h3>
                        <p>{{ station.description }}</p>
                        <div class="station-meta">
                            <span class="frequency">{{ station.frequency }}</span>
                            <span class="location">{{ station.location }}</span>
                            <span class="genre">{{ station.genre }}</span>
                        </div>
                    </div>
                    <div class="station-actions">
                        <button class="play-station-btn" data-stream="{{ station.stream_url }}" data-name="{{ station.title }}">
                            <i class="fas fa-play"></i>
                            Play Live
                        </button>
                    </div>
                </div>
            </div>
            {% endif %}
        {% endfor %}
    </div>
</div>
{% endif %}

<!-- Display Newfoundland and Labrador stations -->
{% if nl_stations.size > 0 %}
<div class="province-section">
    <h2 class="province-header">Newfoundland and Labrador</h2>
    <div class="stations-grid">
        {% for station in nl_stations %}
        {% if station.hidden != true %}
        <div class="station-card">
            <div class="station-header">
                <div class="station-info">
                    <h3><a href="{{ station.url }}">{{ station.title }}</a></h3>
                    <p>{{ station.description }}</p>
                    <div class="station-meta">
                        <span class="frequency">{{ station.frequency }}</span>
                        <span class="location">{{ station.location }}</span>
                        <span class="genre">{{ station.genre }}</span>
                    </div>
                </div>
                <div class="station-actions">
                    <button class="play-station-btn" data-stream="{{ station.stream_url }}" data-name="{{ station.title }}">
                        <i class="fas fa-play"></i>
                        Play Live
                    </button>
                </div>
            </div>
        </div>
                {% endif %}
        {% endfor %}
    </div>
</div>
{% endif %}

<!-- Display Nova Scotia stations -->
{% if ns_stations.size > 0 %}
<div class="province-section">
    <h2 class="province-header">Nova Scotia</h2>
    <div class="stations-grid">
        {% for station in ns_stations %}
        {% if station.hidden != true %}
        <div class="station-card">
            <div class="station-header">
                <div class="station-info">
                    <h3><a href="{{ station.url }}">{{ station.title }}</a></h3>
                    <p>{{ station.description }}</p>
                    <div class="station-meta">
                        <span class="frequency">{{ station.frequency }}</span>
                        <span class="location">{{ station.location }}</span>
                        <span class="genre">{{ station.genre }}</span>
                    </div>
                </div>
                <div class="station-actions">
                    <button class="play-station-btn" data-stream="{{ station.stream_url }}" data-name="{{ station.title }}">
                        <i class="fas fa-play"></i>
                        Play Live
                    </button>
                </div>
            </div>
        </div>
                {% endif %}
        {% endfor %}
    </div>
</div>
{% endif %}

<!-- Display Ontario stations -->
{% if on_stations.size > 0 %}
<div class="province-section">
    <h2 class="province-header">Ontario</h2>
    <div class="stations-grid">
        {% for station in on_stations %}
        {% if station.hidden != true %}
        <div class="station-card">
            <div class="station-header">
                <div class="station-info">
                    <h3><a href="{{ station.url }}">{{ station.title }}</a></h3>
                    <p>{{ station.description }}</p>
                    <div class="station-meta">
                        <span class="frequency">{{ station.frequency }}</span>
                        <span class="location">{{ station.location }}</span>
                        <span class="genre">{{ station.genre }}</span>
                    </div>
                </div>
                <div class="station-actions">
                    <button class="play-station-btn" data-stream="{{ station.stream_url }}" data-name="{{ station.title }}">
                        <i class="fas fa-play"></i>
                        Play Live
                    </button>
                </div>
            </div>
        </div>
        {% endif %}
        {% endfor %}
    </div>
</div>
{% endif %}

<!-- Display Prince Edward Island stations -->
{% if pe_stations.size > 0 %}
<div class="province-section">
    <h2 class="province-header">Prince Edward Island</h2>
    <div class="stations-grid">
        {% for station in pe_stations %}
        {% if station.hidden != true %}
        <div class="station-card">
            <div class="station-header">
                <div class="station-info">
                    <h3><a href="{{ station.url }}">{{ station.title }}</a></h3>
                    <p>{{ station.description }}</p>
                    <div class="station-meta">
                        <span class="frequency">{{ station.frequency }}</span>
                        <span class="location">{{ station.location }}</span>
                        <span class="genre">{{ station.genre }}</span>
                    </div>
                </div>
                <div class="station-actions">
                    <button class="play-station-btn" data-stream="{{ station.stream_url }}" data-name="{{ station.title }}">
                        <i class="fas fa-play"></i>
                        Play Live
                    </button>
                </div>
            </div>
        </div>
        {% endif %}
        {% endfor %}
    </div>
</div>
{% endif %}

<!-- Display Quebec stations -->
{% if qc_stations.size > 0 %}
<div class="province-section">
    <h2 class="province-header">Quebec</h2>
    <div class="stations-grid">
        {% for station in qc_stations %}
        {% if station.hidden != true %}
        <div class="station-card">
            <div class="station-header">
                <div class="station-info">
                    <h3><a href="{{ station.url }}">{{ station.title }}</a></h3>
                    <p>{{ station.description }}</p>
                    <div class="station-meta">
                        <span class="frequency">{{ station.frequency }}</span>
                        <span class="location">{{ station.location }}</span>
                        <span class="genre">{{ station.genre }}</span>
                    </div>
                </div>
                <div class="station-actions">
                    <button class="play-station-btn" data-stream="{{ station.stream_url }}" data-name="{{ station.title }}">
                        <i class="fas fa-play"></i>
                        Play Live
                    </button>
                </div>
            </div>
        </div>
        {% endif %}
        {% endfor %}
    </div>
</div>
{% endif %}

<!-- Display Saskatchewan stations -->
{% if sk_stations.size > 0 %}
<div class="province-section">
    <h2 class="province-header">Saskatchewan</h2>
    <div class="stations-grid">
        {% for station in sk_stations %}
        {% if station.hidden != true %}
        <div class="station-card">
            <div class="station-header">
                <div class="station-info">
                    <h3><a href="{{ station.url }}">{{ station.title }}</a></h3>
                    <p>{{ station.description }}</p>
                    <div class="station-meta">
                        <span class="frequency">{{ station.frequency }}</span>
                        <span class="location">{{ station.location }}</span>
                        <span class="genre">{{ station.genre }}</span>
                    </div>
                </div>
                <div class="station-actions">
                    <button class="play-station-btn" data-stream="{{ station.stream_url }}" data-name="{{ station.title }}">
                        <i class="fas fa-play"></i>
                        Play Live
                    </button>
                </div>
            </div>
        </div>
        {% endif %}
        {% endfor %}
    </div>
</div>
{% endif %}

<!-- Google Ad -->
<div class="ad-container">
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="{{ site.google_adsense_id }}"
         data-ad-slot="1111111111"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>
         (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
</div>

## About Radio Stations in Canada

Canadian sports radio stations offer comprehensive coverage of:

- **NHL Hockey** - Complete coverage of all Canadian teams
- **CFL Football** - From coast to coast coverage
- **MLB Baseball** - Blue Jays and sports analysis
- **NBA Basketball** - Raptors coverage and league news
- **MLS Soccer** - Canadian teams and international coverage
- **Olympics & International Sports** - Canadian athletes and teams

### Popular Shows and Personalities

Listen to Canada's top sports personalities and shows across different time zones:

- **Morning Drive Shows** - Start your day with sports news
- **Afternoon Drive** - Commute with the latest sports updates
- **Evening Shows** - In-depth analysis and call-in shows
- **Weekend Programming** - Game coverage and special features
