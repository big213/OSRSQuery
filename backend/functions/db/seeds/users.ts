import * as Knex from "knex";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  /*   await knex("user").del();

  // Inserts seed entries
  await knex("user").insert([
    {
      name: "James Chang",
      email: "james@thecubicle.com",
      role: "3",
      createdBy: 1,
    },
  ]);

  // also adds the api keys
  await knex("apiKey").del();

  await knex("apiKey").insert([
    {
      name: "Cubicle Nimda",
      code: "LAOVP0x9IrM3VWex6wN7",
      createdBy: 1,
    },
  ]); */

  // update the first user to admin
  await knex("user").where("email", "=", "dr.james.chang@gmail.com").update({
    role: 3,
  });
}
