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

## CFL Team Coverage

### East Division
- **Toronto Argonauts** - TSN 1050, Sportsnet 590
- **Montreal Alouettes** - TSN 690, RDS
- **Ottawa Redblacks** - TSN 1200 Ottawa
- **Hamilton Tiger-Cats** - CHML 900

### West Division
- **Winnipeg Blue Bombers** - CJOB 680, TSN 1290
- **Saskatchewan Roughriders** - CKRM 620 Regina
- **Calgary Stampeders** - Sportsnet 960 Calgary
- **Edmonton Elks** - 630 CHED
- **BC Lions** - Sportsnet 650 Vancouver

<!-- Google Ad -->
<div class="ad-container">
    <ins class="adsbygoogle"
         style="display:block"
         data-ad-client="{{ site.google_adsense_id }}"
         data-ad-slot="3333333333"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
    <script>
         (adsbygoogle = window.adsbygoogle || []).push({});
    </script>
</div>

## Featured Football Stations

<div class="stations-grid" style="margin: 2rem 0;">
    <div class="station-card">
        <div class="station-header">
            <div class="station-info">
                <h3>CFL on TSN Radio</h3>
                <p>Official radio network of the CFL with complete game coverage</p>
                <div class="station-meta">
                    <span class="frequency">Various AM/FM</span>
                    <span class="location">National</span>
                    <span class="genre">Football</span>
                </div>
            </div>
            <div class="station-actions">
                <button class="play-station-btn" data-stream="https://live-audio01.mediavibez.com/CFL-TSN" data-name="CFL on TSN Radio">
                    <i class="fas fa-play"></i>
                    Play Live
                </button>
            </div>
        </div>
    </div>

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
                <button class="play-station-btn" data-stream="{{ roughrider_station.stream_url }}" data-name="Roughrider Radio Network">
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
