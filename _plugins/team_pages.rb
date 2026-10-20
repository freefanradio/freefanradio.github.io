# Generates one page per team in _data/teams.yml at /teams/<slug>/.
module FreeFanRadio
  class TeamPageGenerator < Jekyll::Generator
    safe true
    priority :high

    def generate(site)
      (site.data["teams"] || []).each do |team|
        page = Jekyll::PageWithoutAFile.new(site, site.source, "teams/#{team['slug']}", "index.html")
        page.content = ""
        page.data.merge!(
          "layout" => "team",
          "team" => team,
          "title" => "#{team['name']} Radio in Canada",
          "description" => "How to listen to #{team['name']} games on the radio in Canada: stations, live streams#{team['stations'].any? { |s| s['lang'] == 'fr' } ? ', French broadcast' : ''} and tips."
        )
        site.pages << page
      end
    end
  end
end
