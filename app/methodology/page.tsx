import { BookOpen, ExternalLink, Database, Globe, Wifi } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-6 w-6 text-[#157A3C]" />
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Methodology</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        How we collect, process, and present IPv6 adoption data for Africa.
      </p>

      <div className="grid gap-6">
        {/* APNIC Labs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-[#157A3C]" /> APNIC Labs — IPv6 Deployment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              APNIC Labs measures IPv6 capability and preference by serving test
              advertisements to a global network of participating ad platforms.
              Browsers that load objects via dual-stack (A + AAAA) DNS records
              indicate IPv6 reachability.
            </p>
            <div className="bg-muted p-3 rounded-md">
              <p className="font-semibold mb-1">Key Metrics</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  <strong>IPv6 Preferred %</strong> — Percentage of users whose browser
                  preferred IPv6 when both v4 and v6 were available.
                </li>
                <li>
                  <strong>IPv6 Capable %</strong> — Percentage of users who could reach
                  IPv6-only resources (even if not preferred).
                </li>
                <li>
                  <strong>Sample Size (n)</strong> — Number of unique browser samples in the
                  measurement window.
                </li>
              </ul>
            </div>
            <a
              href="https://stats.labs.apnic.net/ipv6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#157A3C] hover:underline"
            >
              APNIC IPv6 Statistics <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </CardContent>
        </Card>

        {/* AFRINIC */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-[#009B4E]" /> AFRINIC — Delegated Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              AFRINIC publishes a daily file of all address delegations made to
              African network operators. We parse the IPv6 lines and aggregate by
              country to track total IPv6 address space allocated.
            </p>
            <div className="bg-muted p-3 rounded-md">
              <p className="font-semibold mb-1">Key Metrics</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  <strong>Allocation Count</strong> — Number of distinct IPv6 prefix
                  delegations to a country.
                </li>
                <li>
                  <strong>/32 Equivalents</strong> — Total allocated space normalized to /32
                  blocks for comparison.
                </li>
              </ul>
            </div>
            <a
              href="https://ftp.afrinic.net/stats/afrinic/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#009B4E] hover:underline"
            >
              AFRINIC FTP Stats <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </CardContent>
        </Card>

        {/* Cloudflare Radar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wifi className="h-5 w-5 text-[#F5A623]" /> Cloudflare Radar — Traffic Share
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              Cloudflare Radar provides real-time visibility into internet traffic
              patterns. We query the HTTP summary endpoint to determine what
              percentage of web traffic from each country uses IPv6.
            </p>
            <div className="bg-muted p-3 rounded-md">
              <p className="font-semibold mb-1">Key Metric</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  <strong>IPv6 Traffic %</strong> — Share of HTTP requests from the country
                  that arrived over IPv6.
                </li>
              </ul>
            </div>
            <a
              href="https://radar.cloudflare.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#F5A623] hover:underline"
            >
              Cloudflare Radar <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </CardContent>
        </Card>

        {/* Update Frequency */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Update Frequency</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              Data is refreshed <strong>daily at 06:00 UTC</strong> via an automated ETL
              pipeline. Each source is fetched independently, and failures for
              individual countries do not block others.
            </p>
            <p>
              Historical snapshots are stored for trend analysis. The dashboard
              displays the most recent successful data point for each country.
            </p>
          </CardContent>
        </Card>

        {/* ATU Testbed */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ATU IPv6 Testbed Programme</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              The African Telecommunications Union (ATU) has designated six
              countries as IPv6 testbed pilots: <strong>Ghana</strong>,{' '}
              <strong>Botswana</strong>, <strong>Togo</strong>,{' '}
              <strong>Tunisia</strong>, <strong>Cameroon</strong>, and{' '}
              <strong>Tanzania</strong>.
            </p>
            <p>
              These countries receive focused monitoring with dedicated dashboards,
              30/90-day trend tracking, and comparative analysis to support the
              ATU&apos;s IPv6 deployment goals across the continent.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
