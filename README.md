# FreeFanRadio.ca 🏒🏈⚾

**Canada's Premier Sports Radio Streaming Destination**

FreeFanRadio.ca is a comprehensive GitHub Pages website that provides free streaming access to Canadian sports radio stations. Built with Jekyll, it features responsive design, mobile optimization, and Google Ads integration.

## 🎯 Features

- **Live Radio Streaming** - Stream Canadian sports radio stations in real-time
- **Responsive Design** - Mobile-friendly layout that works on all devices
- **Template System** - Jekyll-powered templating for easy content management
- **Google Ads Integration** - Monetization through Google AdSense
- **Progressive Web App** - Offline functionality and app-like experience
- **SEO Optimized** - Search engine friendly with proper meta tags
- **Accessibility** - WCAG compliant design

## 🏆 Coverage

### Sports
- **NHL Hockey** - Complete Canadian team coverage
- **CFL Football** - Coast-to-coast Canadian football
- **MLB Baseball** - Toronto Blue Jays and more
- **NBA Basketball** - Toronto Raptors coverage
- **Olympic Sports** - Canadian athletes and teams

### Stations Featured
- TSN 690 Montreal
- TSN 1050 Toronto  
- Sportsnet 960 Calgary
- Team 1040 Vancouver
- CKRM 620 Regina
- CJOB 680 Winnipeg
- And many more...

## 🚀 Quick Start

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/freefanradio/freefanradio.git
   cd freefanradio
   ```

2. **Install dependencies**
   ```bash
   bundle install
   ```

3. **Run locally**
   ```bash
   bundle exec jekyll serve
   ```

4. **View in browser**
   Open `http://localhost:4000/freefanradio/`

### GitHub Pages Deployment

This site is designed to work seamlessly with GitHub Pages:

1. **Enable GitHub Pages** in repository settings
2. **Set source** to `main` branch
3. **Custom domain** (optional): Configure `freefanradio.ca`
4. **SSL/HTTPS** is automatically enabled

## 📱 Technology Stack

- **Jekyll** - Static site generator
- **HTML5 Audio** - Modern audio streaming
- **CSS Grid/Flexbox** - Responsive layouts
- **Vanilla JavaScript** - No framework dependencies
- **Font Awesome** - Icon library
- **Google Fonts** - Typography (Inter)
- **Service Worker** - Offline functionality

## 🎨 Customization

### Adding New Stations

Create a new file in `_stations/` directory:

```yaml
---
layout: station
title: "Your Station Name"
description: "Station description"
frequency: "XXX.X FM"
location: "City, Province"
genre: "Sports Talk"
category: "sports"
stream_url: "https://your-stream-url.com"
---

Your station content here...
```

### Google Ads Setup

1. **Get AdSense Account** - Apply for Google AdSense
2. **Update `_config.yml`** - Add your AdSense publisher ID
3. **Customize Ad Placements** - Modify ad slots in templates

### Branding

- **Logo** - Replace favicon and icons in `/assets/images/`
- **Colors** - Modify CSS variables in `/assets/css/main.css`
- **Fonts** - Update Google Fonts import in layouts

## 📊 Analytics & SEO

### Google Analytics
1. Create Google Analytics account
2. Add tracking ID to `_config.yml`
3. Analytics automatically included in all pages

### SEO Features
- **Meta tags** - Dynamic title and description
- **Open Graph** - Social media sharing optimization
- **Structured data** - Schema.org markup
- **Sitemap** - Automatically generated
- **Robots.txt** - Search engine guidelines

## 🔧 Configuration

### `_config.yml` Settings

```yaml
# Site settings
title: "FreeFanRadio.ca"
description: "Stream Canadian Sports Radio Stations"
url: "https://freefanradio.github.io"
baseurl: ""

# Google AdSense
google_adsense_id: "ca-pub-XXXXXXXXXXXXXXXXX"

# Google Analytics  
google_analytics: G-XXXXXXXXXX
```

## 📱 Progressive Web App

The site includes PWA features:
- **Manifest file** - App-like installation
- **Service Worker** - Offline functionality
- **Responsive design** - Mobile optimized
- **Touch icons** - iOS/Android support

## 🛡️ Security & Performance

### Security
- **HTTPS enforced** - SSL/TLS encryption
- **CSP headers** - Content Security Policy (via GitHub Pages)
- **No user data collection** - Privacy focused

### Performance
- **Minified assets** - Optimized CSS/JS
- **Image optimization** - Compressed images
- **CDN delivery** - GitHub Pages CDN
- **Lazy loading** - Images loaded on demand

## 📄 License & Legal

### Content
- **Radio streams** - Links to publicly available streams
- **Station information** - Factual information only
- **Respect copyright** - No unauthorized content

### Code
- **Open source** - MIT License
- **Attribution** - Credit original authors
- **Commercial use** - Allowed with attribution

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### Contribution Guidelines
- Follow existing code style
- Test on multiple devices
- Update documentation
- Respect Canadian broadcasting regulations

## 📞 Support

### Technical Issues
- **GitHub Issues** - Report bugs and feature requests
- **Email** - info@freefanradio.ca
- **Documentation** - Check this README and code comments

### Browser Support
- **Chrome** 60+
- **Firefox** 55+
- **Safari** 11+
- **Edge** 79+
- **Mobile browsers** - iOS Safari, Chrome Mobile

## 🎉 Acknowledgments

- **Canadian broadcasters** - For providing quality sports coverage
- **Jekyll team** - For the excellent static site generator  
- **GitHub** - For free hosting via GitHub Pages
- **Font Awesome** - For the beautiful icons
- **Google Fonts** - For the typography

---

**FreeFanRadio.ca** - *Connecting Canadian sports fans one stream at a time* 🇨🇦

Built with ❤️ for Canadian sports fans everywhere.