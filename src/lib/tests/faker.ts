"use server";

import { faker } from "@faker-js/faker";
import { logger } from "@/lib/logger";
import { PBBrowser } from "../pb";

const pb = PBBrowser.getInstance().pbClient;

export async function generateFakeUser() {
  return {
    email: faker.internet.email(),
    name: faker.person.fullName(),
    password: faker.internet.password(),
    role: faker.helpers.arrayElement(["member"]),
    avatar: faker.image.avatar()
  };
}

export async function populateFakeUsers(count: number) {
  for (let i = 0; i < count; i++) {
    const user = await generateFakeUser();

    const response = await fetch(user.avatar);

    let file;
    if (response.ok) {
      const blob = await response.blob();

      file = new File([blob], `avatar-${i}.jpg`, {
        type: blob.type || "image/jpeg"
      });
    }

    try {
      await pb.collection("users").create({
        email: user.email,
        password: user.password,
        passwordConfirm: user.password,
        role: user.role,
        name: user.name,
        emailVisibility: true,
        avatar: file
      });
    } catch (error) {
      logger.error({ err: (error as any)?.message }, "Error creating user");
    }
  }
}

export async function populateFakeOutreachSessions(count: number) {
  // UserData is a view collection
  // OutreachSessions is a collection with the following fields:
  // - user (relation to UserData)
  // - minutes (number)
  // - event (relation to OutreachEvents) (use id "9a6i619u8dqp344" for now)

  const numUsers = (await pb.collection("users").getList(1, 1)).totalItems;

  for (let i = 0; i < count; i++) {
    const randUser = faker.number.int({ min: 2, max: numUsers - 1 });
    const user = await pb.collection("users").getList(randUser, 1);

    const minutes = faker.number.int({ min: 1, max: 900 });

    try {
      await pb.collection("OutreachSessions").create({
        user: user.items[0].id,
        minutes,
        event: "9a6i619u8dqp344" // Use a fixed event ID for now
      });
    } catch (error) {
      logger.error(
        { err: (error as any)?.message },
        "Error creating outreach session"
      );
    }
  }
}
