import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { ModuleProgressCard } from '../components/dashboard/ModuleProgressCard';

function Dashboard() {
	const { user } = useAuth();
	const [dashboard, setDashboard] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let isActive = true;

		const loadDashboard = async () => {
			setLoading(true);
			setError('');

			try {
				const data = await dashboardService.getDashboard();

				if (!isActive) return;
				setDashboard(data);
			} catch (err) {
				if (!isActive) return;
				setError(err.message || 'Failed to load dashboard data.');
			} finally {
				if (isActive) setLoading(false);
			}
		};

		loadDashboard();

		return () => {
			isActive = false;
		};
	}, [user]);

	const summary = dashboard?.summary || {
		registeredModules: 0,
		completedModules: 0,
		averageCompletion: 0,
		totalQuizScore: 0,
		totalQuizAttempts: 0,
		totalQuizzes: 0,
		completedDays: 0,
		totalDays: 0,
	};

	const moduleRows = dashboard?.modules || [];

	if (loading) {
		return <div className="dashboard-shell dashboard-loading">Loading your dashboard...</div>;
	}

	return <div className="dashboard-shell">
			<DashboardHero
				username={dashboard?.user?.username || user?.username || 'student'}
				summary={summary}
			/>

			{error ? <div className="dashboard-alert dashboard-alert-error">{error}</div> : null}

			<DashboardStats
				summary={summary}
			/>

			<section className="dashboard-section">
				<div className="dashboard-section-header">
					<div>
						<h2>Module progress</h2>
						<p>See quiz progress, module completion, quiz score, and how much of each module is complete.</p>
					</div>
					<div className="dashboard-section-chip">{summary.totalDays} learning days tracked</div>
				</div>

				<div className="dashboard-grid">
					{moduleRows.length > 0 ? moduleRows.map((row, index) => <ModuleProgressCard key={row.id || row._id} row={row} index={index} />) : <div className="dashboard-empty">No registered modules yet.</div>}
				</div>
			</section>
		</div>;
}

export default Dashboard;
