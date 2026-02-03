"use client";

import React, { useState } from 'react';
// @ts-ignore: papaparse may not have types in this workspace
import Papa from 'papaparse';

const EventAttendanceReport = () => {
	const [events, setEvents] = useState<any[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [filesUploaded, setFilesUploaded] = useState<boolean>(false);

	const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (files.length < 2) {
			setError('Please upload both ActivityEvents and ActivitySessions CSV files');
			return;
		}

		setLoading(true);
		setError(null);

		try {
			let eventsFile: File | undefined, sessionsFile: File | undefined, usersFile: File | undefined;
			files.forEach(file => {
				if (file.name.includes('ActivityEvents')) eventsFile = file;
				else if (file.name.includes('ActivitySessions')) sessionsFile = file;
				else if (file.name.includes('Misc')) usersFile = file;
			});

			if (!eventsFile || !sessionsFile) {
				throw new Error('Missing required files. Please upload ActivityEvents and ActivitySessions CSVs');
			}

			const eventsText = await eventsFile.text();
			const eventsParsed = Papa.parse(eventsText, {
				header: true,
				dynamicTyping: true,
				skipEmptyLines: true,
				transformHeader: (header: string) => header.trim()
			});

			const sessionsText = await sessionsFile.text();
			const sessionsParsed = Papa.parse(sessionsText, {
				header: true,
				dynamicTyping: true,
				skipEmptyLines: true,
				transformHeader: (header: string) => header.trim()
			});

			let userMap: Record<string, string> = {};
			if (usersFile) {
				const usersText = await usersFile.text();
				const usersParsed = Papa.parse(usersText, {
					header: true,
					dynamicTyping: true,
					skipEmptyLines: true,
					transformHeader: (header: string) => header.trim()
				});

				(usersParsed.data as any[]).forEach(row => {
					if (row.user_id && row.user_name) {
						userMap[String(row.user_id)] = row.user_name;
					}
				});
			}

			const filteredEvents = (eventsParsed.data as any[])
				.filter(event =>
					event.event_name &&
					!String(event.event_name).includes('Manual Hours') &&
					!String(event.event_name).includes("don't delete")
				)
				.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

			const eventAttendance = filteredEvents.map(event => {
				const attendees = (sessionsParsed.data as any[])
					.filter(session => String(session.event_id) === String(event.id))
					.map(session => ({
						userId: session.user_id,
						userName: userMap[String(session.user_id)] || `User ${session.user_id}`,
						minutes: session.minutes || 0,
						hours: ((session.minutes || 0) / 60).toFixed(2)
					}))
					.sort((a, b) => String(a.userName).localeCompare(String(b.userName)));

				return {
					id: event.id,
					name: event.event_name,
					date: new Date(event.event_date).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					}),
					attendees: attendees,
					totalAttendees: attendees.length
				};
			});

			setEvents(eventAttendance);
			setFilesUploaded(true);
			setLoading(false);
		} catch (err: any) {
			setError(err?.message || String(err));
			setLoading(false);
		}
	};

	if (!filesUploaded) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Upload CSV Files</h2>
					<p className="text-gray-600 mb-6">
						Please upload the following CSV files to generate the attendance report:
					</p>
					<ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
						<li>ActivityEvents_rows.csv (required)</li>
						<li>ActivitySessions_rows.csv (required)</li>
						<li>Supabase Snippet Test_Misc.csv (optional - for user names)</li>
					</ul>
					<input
						type="file"
						multiple
						accept=".csv"
						onChange={handleFileUpload}
						className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
					/>
					{error && (
						<div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
							{error}
						</div>
					)}
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="text-lg text-gray-600">Loading event data...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Event Attendance Report</h1>
						<p className="text-gray-600">2025 Outreach Events (excluding Manual Hours)</p>
					</div>
					<button
						onClick={() => {
							setFilesUploaded(false);
							setEvents([]);
							setError(null);
						}}
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
					>
						Upload New Files
					</button>
				</div>

				<div className="space-y-6">
					{events.map((event: any) => (
						<div key={event.id} className="bg-white rounded-lg shadow-md p-6">
							<div className="flex justify-between items-start mb-4">
								<div>
									<h2 className="text-xl font-semibold text-gray-900">{event.name}</h2>
									<p className="text-sm text-gray-500 mt-1">{event.date}</p>
								</div>
								<span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
									{event.totalAttendees} {event.totalAttendees === 1 ? 'attendee' : 'attendees'}
								</span>
							</div>

							{event.attendees.length > 0 ? (
								<div className="border-t pt-4">
									<table className="w-full">
										<thead>
											<tr className="text-left text-sm text-gray-600 border-b">
												<th className="pb-2">Name</th>
												<th className="pb-2 text-right">Hours</th>
											</tr>
										</thead>
										<tbody>
											{event.attendees.map((attendee: any, idx: number) => (
												<tr key={idx} className="border-b last:border-b-0">
													<td className="py-2 text-gray-800">{attendee.userName}</td>
													<td className="py-2 text-right text-gray-600">{attendee.hours}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							) : (
								<p className="text-gray-500 italic border-t pt-4">No attendees recorded</p>
							)}
						</div>
					))}
				</div>

				{events.length === 0 && (
					<div className="text-center text-gray-500 py-12">
						No events found
					</div>
				)}
			</div>
		</div>
	);
};

export default EventAttendanceReport;

