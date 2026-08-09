export interface Person {
  username: string;
  firstName: string | null;
  lastName: string | null;
}

export interface Organisation {
  name: string;
  invitationCode: string;
  members: Person[];
  managers: Person[];
}

export interface MemberOrganisation {
  name: string;
  owner: { username: string };
}
