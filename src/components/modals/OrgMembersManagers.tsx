import { useContext, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, UserRoundX } from "lucide-react";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { ModalContext } from "../../contexts/ModalContext";
import Button from "../ui/Button";
import type { MutationPayload } from "../../types/api";
import type { Organisation, Person } from "../../types/organisation";

const PAGE_SIZE = 10;

type RolePayload = MutationPayload & { organisation: { members: Person[]; managers: Person[] } };
type RoleVariables = { orgName: string; username: string; token: string };

const OrgMembersManagers = ({ managers, org }: { managers: boolean; org: Organisation | null }) => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [people, setPeople] = useState<Person[]>([]);
  const [page, setPage] = useState(1);

  const [kickOrganisationMember] = useMutation<
    { kickOrganisationMember: RolePayload },
    RoleVariables
  >(gql`
    mutation KickOrganisationMember($orgName: String!, $username: String!, $token: String!) {
      kickOrganisationMember(orgName: $orgName, username: $username, token: $token) {
        success
        errors
        organisation {
          members {
            username
            firstName
            lastName
          }
        }
      }
    }
  `);
  const [promoteOrganisationMember] = useMutation<
    { promoteOrganisationMember: RolePayload },
    RoleVariables
  >(gql`
    mutation PromoteOrganisationMember($orgName: String!, $username: String!, $token: String!) {
      promoteOrganisationMember(orgName: $orgName, username: $username, token: $token) {
        success
        errors
        organisation {
          members {
            username
            firstName
            lastName
          }
        }
      }
    }
  `);
  const [demoteOrganisationManager] = useMutation<
    { demoteOrganisationManager: RolePayload },
    RoleVariables
  >(gql`
    mutation DemoteOrganisationManager($orgName: String!, $username: String!, $token: String!) {
      demoteOrganisationManager(orgName: $orgName, username: $username, token: $token) {
        success
        errors
        organisation {
          managers {
            username
            firstName
            lastName
          }
        }
      }
    }
  `);

  useEffect(() => {
    if (activeModal !== "orgMembersManagers") return;
    setPeople(managers ? (org?.managers ?? []) : (org?.members ?? []));
    setPage(1);
  }, [activeModal, managers, org]);

  const pageCount = Math.max(1, Math.ceil(people.length / PAGE_SIZE));
  const visiblePeople = useMemo(
    () => people.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, people],
  );
  const close = () => setActiveModal(null);

  const changeRole = (person: Person) => {
    if (!org) return;
    const variables = {
      orgName: org.name,
      username: person.username,
      token: localStorage.getItem("accessToken") ?? "",
    };
    if (managers) {
      demoteOrganisationManager({ variables }).then((result) => {
        const response = result.data?.demoteOrganisationManager;
        if (response?.success) setPeople(response.organisation.managers);
      });
    } else {
      promoteOrganisationMember({ variables }).then((result) => {
        const response = result.data?.promoteOrganisationMember;
        if (response?.success) setPeople(response.organisation.members);
      });
    }
  };

  const removeMember = (person: Person) => {
    if (!org) return;
    kickOrganisationMember({
      variables: {
        orgName: org.name,
        username: person.username,
        token: localStorage.getItem("accessToken") ?? "",
      },
    }).then((result) => {
      const response = result.data?.kickOrganisationMember;
      if (response?.success) setPeople(response.organisation.members);
    });
  };

  return (
    <div
      className={`modal ${activeModal === "orgMembersManagers" ? "is-active" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="people-dialog-title"
    >
      <button
        type="button"
        className="modal-background"
        aria-label="Close dialog"
        onClick={close}
      />
      <div className="modal-card rounded-[4px]">
        <header className="modal-card-head">
          <div>
            <p id="people-dialog-title" className="modal-card-title">
              {managers ? "Group Managers" : "Group Members"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{org?.name}</p>
          </div>
          <button type="button" className="delete" aria-label="Close" onClick={close} />
        </header>
        <section className="modal-card-body p-0">
          {people.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              No {managers ? "managers" : "members"} in this group.
            </p>
          ) : (
            <div>
              <div className="hidden table-container sm:block">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th className="px-4">User</th>
                      <th className="px-4">Name</th>
                      <th className="px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visiblePeople.map((person) => (
                      <tr key={person.username}>
                        <td className="px-4 py-3 font-mono text-sm">@{person.username}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {person.firstName && person.lastName
                            ? `${person.firstName} ${person.lastName}`
                            : "Not provided"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() => changeRole(person)}
                            >
                              {managers ? (
                                <ArrowDown className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowUp className="h-3.5 w-3.5" />
                              )}
                              {managers ? "Demote" : "Promote"}
                            </Button>
                            {!managers && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                aria-label={`Remove ${person.username}`}
                                onClick={() => removeMember(person)}
                              >
                                <UserRoundX className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="divide-y sm:hidden">
                {visiblePeople.map((person) => (
                  <div key={person.username} className="px-5 py-4">
                    <strong className="block font-mono text-sm">@{person.username}</strong>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {person.firstName && person.lastName
                        ? `${person.firstName} ${person.lastName}`
                        : "Name not provided"}
                    </span>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => changeRole(person)}
                      >
                        {managers ? (
                          <ArrowDown className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowUp className="h-3.5 w-3.5" />
                        )}
                        {managers ? "Demote" : "Promote"}
                      </Button>
                      {!managers && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove ${person.username}`}
                          onClick={() => removeMember(person)}
                        >
                          <UserRoundX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
        <footer className="modal-card-foot justify-between">
          <span className="text-xs text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === pageCount}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default OrgMembersManagers;
