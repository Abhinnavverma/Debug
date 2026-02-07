'use client';

import type { Attempt } from '@/types/analytics';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { Users, TrendingUp, Award, Clock } from 'lucide-react';

const COLORS = [
  'hsl(221, 83%, 53%)',
  'hsl(262, 83%, 58%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
];

function averageScoreBy(
  attempts: Attempt[],
  key: 'background' | 'experience' | 'prodExperience'
) {
  const groups: Record<string, { total: number; count: number }> = {};
  for (const a of attempts) {
    const k = String(a[key]);
    if (!groups[k]) groups[k] = { total: 0, count: 0 };
    groups[k].total += a.feedback.shippingReadinessScore;
    groups[k].count += 1;
  }
  return Object.entries(groups).map(([name, { total, count }]) => ({
    name,
    avgScore: Math.round(total / count),
    count,
  }));
}

function averageScorecardBy(
  attempts: Attempt[],
  key: 'background' | 'experience' | 'prodExperience'
) {
  const groups: Record<
    string,
    {
      investigativeEngagement: number;
      signalDetection: number;
      hypothesisFormation: number;
      debuggingDiscipline: number;
      decisionReadiness: number;
      count: number;
    }
  > = {};
  for (const a of attempts) {
    const k = String(a[key]);
    if (!groups[k])
      groups[k] = {
        investigativeEngagement: 0,
        signalDetection: 0,
        hypothesisFormation: 0,
        debuggingDiscipline: 0,
        decisionReadiness: 0,
        count: 0,
      };
    groups[k].investigativeEngagement += a.feedback.scorecard.investigativeEngagement;
    groups[k].signalDetection += a.feedback.scorecard.signalDetection;
    groups[k].hypothesisFormation += a.feedback.scorecard.hypothesisFormation;
    groups[k].debuggingDiscipline += a.feedback.scorecard.debuggingDiscipline;
    groups[k].decisionReadiness += a.feedback.scorecard.decisionReadiness;
    groups[k].count += 1;
  }

  const dimensions = [
    'Investigative Engagement',
    'Signal Detection',
    'Hypothesis Formation',
    'Debugging Discipline',
    'Decision Readiness',
  ];

  const keys = Object.keys(groups);
  return dimensions.map((dim) => {
    const entry: Record<string, string | number> = { dimension: dim };
    for (const k of keys) {
      const g = groups[k];
      const field = dim
        .replace(/ /g, '')
        .replace(/^./, (c) => c.toLowerCase()) as keyof typeof g;
      if (field !== 'count') {
        entry[k] = Math.round(((g[field] as number) / g.count) * 10) / 10;
      }
    }
    return entry;
  });
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function ScoreChart({
  data,
  title,
  description,
}: {
  data: { name: string; avgScore: number; count: number }[];
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                className="fill-muted-foreground"
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                className="fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number, _name: string, props: { payload?: { count: number } }) => [
                  `${value}${props.payload ? ` (n=${props.payload.count})` : ''}`,
                  'Avg Score',
                ]}
              />
              <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground py-8">No data yet</p>
        )}
      </CardContent>
    </Card>
  );
}

function SkillRadarChart({ attempts }: { attempts: Attempt[] }) {
  const radarData = averageScorecardBy(attempts, 'background');
  const backgrounds = [
    ...new Set(attempts.map((a) => a.background)),
  ];

  if (attempts.length === 0) return null;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-base">Skill Dimensions by Background</CardTitle>
        <CardDescription>
          Where each cohort is strong vs weak — the real differentiator
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
            <PolarGrid />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 10 }} />
            {backgrounds.map((bg, i) => (
              <Radar
                key={bg}
                name={bg}
                dataKey={bg}
                stroke={COLORS[i % COLORS.length]}
                fill={COLORS[i % COLORS.length]}
                fillOpacity={0.15}
              />
            ))}
            <Legend />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function AnalyticsDashboard({ attempts }: { attempts: Attempt[] }) {
  const totalAttempts = attempts.length;
  const avgScore =
    totalAttempts > 0
      ? Math.round(
          attempts.reduce((s, a) => s + a.feedback.shippingReadinessScore, 0) /
            totalAttempts
        )
      : 0;
  const avgTime =
    totalAttempts > 0
      ? Math.round(
          attempts.reduce((s, a) => s + a.totalTimeSpent, 0) / totalAttempts
        )
      : 0;

  const byBackground = averageScoreBy(attempts, 'background');
  const byExperience = averageScoreBy(attempts, 'experience');
  const byProdExp = averageScoreBy(attempts, 'prodExperience');

  const topCohort =
    byBackground.length > 0
      ? byBackground.reduce((best, curr) =>
          curr.avgScore > best.avgScore ? curr : best
        )
      : null;

  const getVerdictVariant = (verdict: string) => {
    switch (verdict) {
      case 'Ready to Ship Independently':
        return 'default';
      case 'Requires Support':
        return 'secondary';
      case 'Not Ready for Production Work':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Experiment Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Real user data from debugging skill assessments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Attempts"
          value={totalAttempts}
          subtitle="Across all problems"
          icon={Users}
        />
        <SummaryCard
          title="Average Score"
          value={`${avgScore}/100`}
          subtitle="Shipping Readiness Score"
          icon={TrendingUp}
        />
        <SummaryCard
          title="Top Cohort"
          value={topCohort ? topCohort.name : '—'}
          subtitle={topCohort ? `Avg score: ${topCohort.avgScore}` : 'No data yet'}
          icon={Award}
        />
        <SummaryCard
          title="Avg Time Spent"
          value={`${Math.floor(avgTime / 60)}m ${avgTime % 60}s`}
          subtitle="Per attempt"
          icon={Clock}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ScoreChart
          data={byBackground}
          title="Score by Background"
          description="Does LeetCode prep translate to debugging skill?"
        />
        <ScoreChart
          data={byExperience}
          title="Score by Experience"
          description="How do years of experience correlate?"
        />
        <ScoreChart
          data={byProdExp}
          title="Score by Prod Experience"
          description="Impact of production debugging experience"
        />
      </div>

      {/* Radar Chart */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SkillRadarChart attempts={attempts} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key Insight</CardTitle>
            <CardDescription>What the data reveals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalAttempts === 0 ? (
              <p className="text-muted-foreground text-sm">
                Share the link and get users to attempt problems. Charts will
                populate with real data showing how scores differ by background
                and experience.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Hypothesis</p>
                  <p className="text-sm text-muted-foreground">
                    LeetCode/competitive programming ability does not predict
                    production debugging skill. Engineers with real production
                    experience outperform pure algorithmic problem solvers.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Sample Size</p>
                  <p className="text-sm text-muted-foreground">
                    {totalAttempts} attempts across {byBackground.length} background
                    cohorts. Cohort breakdown:{' '}
                    {byBackground
                      .map((b) => `${b.name} (n=${b.count})`)
                      .join(', ')}
                  </p>
                </div>
                {byProdExp.length === 2 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Prod Experience Delta</p>
                    <p className="text-sm text-muted-foreground">
                      Users with production debugging experience scored{' '}
                      <span className="font-semibold">
                        {Math.abs(
                          (byProdExp.find((b) => b.name === 'Yes')?.avgScore ?? 0) -
                            (byProdExp.find((b) => b.name === 'No')?.avgScore ?? 0)
                        )}{' '}
                        points
                      </span>{' '}
                      {(byProdExp.find((b) => b.name === 'Yes')?.avgScore ?? 0) >
                      (byProdExp.find((b) => b.name === 'No')?.avgScore ?? 0)
                        ? 'higher'
                        : 'lower'}{' '}
                      on average.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Attempts</CardTitle>
          <CardDescription>
            Raw data from all {totalAttempts} user attempts, most recent first
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Problem</TableHead>
                  <TableHead>Background</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Prod Exp.</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                  <TableHead>Verdict</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((attempt, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {attempt.problemId}
                    </TableCell>
                    <TableCell>{attempt.background}</TableCell>
                    <TableCell>{attempt.experience} yrs</TableCell>
                    <TableCell>{attempt.prodExperience}</TableCell>
                    <TableCell className="text-right font-mono">
                      {attempt.feedback.shippingReadinessScore}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getVerdictVariant(attempt.feedback.verdict)}>
                        {attempt.feedback.verdict}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {Math.round(attempt.totalTimeSpent)}s
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {attempts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No attempt data recorded yet. Share the link and get users to
                attempt problems!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
