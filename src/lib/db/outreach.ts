import { OutreachEvent, OutreachSession } from "@/lib/types/pocketbase";
import { type PBClientBase } from "../pb";

import { ErrorCodes } from "../states";
import { logger } from "../logger";

export async function fetchEvents(
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, OutreachEvent[]]> {
  return client.getFullList<OutreachEvent>("OutreachEvents", undefined, {
    sort: "-created"
  });
}

export async function createEvent(
  data: { name: string; date: string },
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, OutreachEvent]> {
  const result = await client.createOne<OutreachEvent>("OutreachEvents", data);

  const [, record] = result;
  if (record) {
    logger.info(
      { eventId: record.id, name: data.name },
      "Outreach event created"
    );
  }

  return result;
}

export async function updateEvent(
  id: string,
  data: Partial<Pick<OutreachEvent, "name" | "date">>,
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, OutreachEvent]> {
  const result = await client.updateOne<OutreachEvent>(
    "OutreachEvents",
    id,
    data
  );

  const [, record] = result;
  if (record) {
    logger.info({ eventId: id, ...data }, "Outreach event updated");
  }

  return result;
}

export async function deleteEvent(
  id: string,
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, true]> {
  const result = await client.deleteOne("OutreachEvents", id);

  if (!result[0]) {
    logger.warn({ eventId: id }, "Outreach event deleted");
  }

  return result;
}

export async function fetchSessionsForEvent(
  eventId: string,
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, OutreachSession[]]> {
  return client.getFullList<OutreachSession>("OutreachSessions", undefined, {
    filter: `event = "${eventId}"`,
    expand: "user",
    sort: "-created"
  });
}

export async function deleteSession(
  id: string,
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, true]> {
  const result = await client.deleteOne("OutreachSessions", id);

  if (!result[0]) {
    logger.warn({ sessionId: id }, "Outreach session deleted");
  }

  return result;
}

export async function createSessionsBulk(
  sessions: { userId: string; eventId: string; minutes: number }[],
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, OutreachSession[]]> {
  const createdSessions: OutreachSession[] = [];

  for (const session of sessions) {
    const [error, record] = await client.createOne<OutreachSession>(
      "OutreachSessions",
      {
        user: session.userId,
        event: session.eventId,
        minutes: session.minutes
      },
      { requestKey: null }
    );

    if (error || !record) {
      return [error ?? "01x01", null];
    }

    createdSessions.push(record);
  }

  logger.info(
    { count: createdSessions.length, eventId: sessions[0]?.eventId },
    "Bulk outreach sessions created"
  );

  return [null, createdSessions];
}

export async function fetchUserSessionEventDates(
  userId: string,
  client: PBClientBase
): Promise<[ErrorCodes, null] | [null, string[]]> {
  const [error, sessions] = await client.getFullList<OutreachSession>(
    "OutreachSessions",
    undefined,
    {
      filter: `user="${userId}"`,
      expand: "event"
    }
  );

  if (error) {
    return [error, null];
  }

  const dates = (sessions ?? [])
    .map((r) => r.expand?.event?.date)
    .filter(Boolean) as string[];

  return [null, dates];
}
export async function getOutreachMinutesCutoff(client: PBClientBase) {
  const [error, record] = await client.getFirstListItem(
    "Settings",
    "key='OutreachMinsCutoff'"
  );

  if (error) {
    logger.error(
      { key: "OutreachMinsCutoff", code: error },
      "Failed to fetch outreach minutes cutoff"
    );
    return 900;
  }

  const outreachMinutesCutoff = parseInt(record.value) || 900;
  return outreachMinutesCutoff;
}
