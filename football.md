---
layout: page
title: "Football Radio"
description: "Canadian football radio covering CFL, NFL, and university football across Canada"
permalink: /football/
---

<div class="page-intro" style="text-align: center; margin-bottom: 3rem; padding: 2rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 12px;">
    <h2 style="font-size: 2rem; margin-bottom: 1rem;">🏈 Canadian Football Radio</h2>
    <p style="font-size: 1.1rem; opacity: 0.9;">Complete coverage of CFL, NFL, and university football from coast to coast</p>
</div>

## CFL Team Radio

{% include team-list.html league="CFL" %}

## NFL Team Radio in Canada

{% include team-list.html league="NFL" %}

[Search all teams](/teams/)

## Featured Football Stations

<div class="stations-grid" style="margin: 2rem 0;">
    {% include station-card.html station_id="tsn-1050-toronto" %}

    {% assign roughrider_station = site.stations | where: "slug", "ckrm-620-regina" | first %}
    {% if roughrider_station %}
    <div class="station-card">
        <div class="station-header">
            <div class="station-info">
                <h3>Roughrider Radio Network</h3>
                <p>{{ roughrider_station.description }}</p>
                <div class="station-meta">
                    <span class="frequency">{{ roughrider_station.frequency }}</span>
                    <span class="location">Saskatchewan</span>
                    <span class="genre">CFL</span>
                </div>
            </div>
            <div class="station-actions">
                <button class="play-station-btn" data-station-id="{{ roughrider_station.station_id }}" data-name="Roughrider Radio Network">
                    <i class="fas fa-play"></i>
                    Play Live
                </button>
            </div>
        </div>
    </div>
    {% endif %}
</div>

## CFL Season Schedule

### Pre-Season (May - June)
- **Training Camp Reports** - Daily updates from team facilities
- **Pre-Season Game Coverage** - All exhibition games
- **Roster Analysis** - In-depth player evaluation

### Regular Season (June - October)
- **Weekly Game Coverage** - All 81 regular season games
- **Monday Night Football Review** - Complete game analysis
- **Injury Reports** - Daily player status updates
- **Trade Deadline Coverage** - Mid-season moves

### Playoffs (November)
- **Division Semi-Finals** 
- **Division Finals**
- **Grey Cup Week** - Extended coverage leading to championship

## University Football

### Canadian University Football
- **U Sports Championship** - Vanier Cup coverage
- **Atlantic University Sport (AUS)**
- **Canada West Universities Athletic Association**
- **Ontario University Athletics (OUA)**
- **Réseau du sport étudiant du Québec (RSEQ)**

### Major Programs
- **Western Mustangs**
- **Laval Rouge et Or** 
- **Calgary Dinos**
- **Queen's Golden Gaels**

## NFL Coverage

While focused on Canadian football, many stations provide:
- **Monday Night Football** analysis
- **Sunday Night recaps** 
- **Thursday Night preview shows**
- **Super Bowl coverage**
- **NFL Draft** analysis with Canadian prospects

## Special Programming

### Grey Cup Week
- **Grey Cup Festival Coverage**
- **Alumni Games and Events**
- **Championship Game Build-up**
- **Post-Game Celebration**

### CFL Awards
- **Most Outstanding Player**
- **Coach of the Year** 
- **Rookie of the Year**
- **All-Star Team Announcements**

### Hall of Fame
- **Canadian Football Hall of Fame** induction coverage
- **Legend interviews** and retrospectives
