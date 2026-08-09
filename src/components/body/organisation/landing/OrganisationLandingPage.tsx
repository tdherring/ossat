import { useState, useEffect, useContext, useCallback } from "react";
import { Check, Plus, ShieldUser, Trash2, Users } from "lucide-react";
import { gql } from "@apollo/client";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { ModalContext } from "../../../../contexts/ModalContext";
import ConfirmDeleteOrg from "../../../modals/ConfirmDeleteOrg";
import OrgMembersManagers from "../../../modals/OrgMembersManagers";
import PerformanceData from "../PerformanceData";
import Button from "../../../ui/Button";
import type { ApiErrors, MutationPayload } from "../../../../types/api";
import type { MemberOrganisation, Organisation } from "../../../../types/organisation";

interface UserPermissions {
  me: {
    isOrgCreator: boolean;
    managerOf: { name: string }[];
    memberOf: MemberOrganisation[];
  } | null;
}

interface OrganisationMutationPayload extends MutationPayload {
  organisation: { name: string };
}

const OrganisationLandingPage = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [managersPressed, setManagersPressed] = useState(false);
  const [managingOrg, setManagingOrg] = useState<Organisation | null>(null);
  const [isOrgCreator, setIsOrgCreator] = useState(false);
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [memberOrganisation, setMemberOrganisation] = useState<MemberOrganisation | null>(null);
  const [managerOrganisations, setManagerOrganisations] = useState<{ name: string }[]>([]);
  const [newOrgName, setNewOrgName] = useState("");
  const [createOrganisationErrors, setCreateOrganisationErrors] = useState<ApiErrors>({});
  const [invitationCode, setInvitationCode] = useState("");
  const [joinOrganisationResult, setJoinOrganisationResult] =
    useState<OrganisationMutationPayload | null>(null);
  const [joinOrganisationResultErrors, setJoinOrganisationResultErrors] = useState<ApiErrors>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleteOrgName, setDeleteOrgName] = useState<string | null>(null);
  const client = useApolloClient();

  const checkPermissions = useCallback(
    () =>
      client
        .query<UserPermissions>({
          fetchPolicy: "network-only",
          query: gql`
            query GetUserInfo {
              me {
                isOrgCreator
                managerOf {
                  name
                }
                memberOf {
                  name
                  owner {
                    username
                  }
                }
              }
            }
          `,
        })
        .then((result) => {
          const user = result.data?.me;
          if (!user) return;
          setManagerOrganisations(user.managerOf ?? []);
          setIsOrgCreator(Boolean(user.isOrgCreator));
          setMemberOrganisation(user.memberOf?.[0] ?? null);
        }),
    [client],
  );

  const getOrganisations = useCallback(
    () =>
      client
        .query<{ getOrganisations: Organisation[] }, { token: string }>({
          fetchPolicy: "network-only",
          query: gql`
            query GetOrganisations($token: String!) {
              getOrganisations(token: $token) {
                name
                invitationCode
                members {
                  username
                  firstName
                  lastName
                }
                managers {
                  username
                  firstName
                  lastName
                }
              }
            }
          `,
          variables: { token: localStorage.getItem("accessToken") ?? "" },
        })
        .then((result) => {
          setOrganisations(result.data?.getOrganisations ?? []);
          setLoading(false);
          setLoadError(false);
        })
        .catch(() => {
          setLoading(false);
          setLoadError(true);
        }),
    [client],
  );

  const [createOrganisation] = useMutation<
    { createOrganisation: OrganisationMutationPayload },
    { name: string; token: string }
  >(gql`
    mutation CreateOrganisation($name: String!, $token: String!) {
      createOrganisation(name: $name, token: $token) {
        success
        errors
        organisation {
          name
        }
      }
    }
  `);
  const [joinOrganisation] = useMutation<
    { joinOrganisation: OrganisationMutationPayload },
    { token: string; invitationCode: string }
  >(gql`
    mutation joinOrganisation($token: String!, $invitationCode: String!) {
      joinOrganisation(token: $token, invitationCode: $invitationCode) {
        success
        errors
        organisation {
          name
        }
      }
    }
  `);

  useEffect(() => {
    checkPermissions();
    getOrganisations();
  }, [activeModal, checkPermissions, getOrganisations]);

  const openPeople = (org: Organisation, managers: boolean) => {
    setManagersPressed(managers);
    setManagingOrg(org);
    setActiveModal("orgMembersManagers");
  };

  if (loading)
    return (
      <div className="col-span-12 py-16 text-center text-sm text-muted-foreground">
        Loading learning groups…
      </div>
    );
  if (loadError)
    return (
      <div className="col-span-12 border border-destructive/40 px-5 py-8 text-sm text-destructive">
        Learning groups could not be loaded.
      </div>
    );

  const canManage = isOrgCreator || managerOrganisations.length > 0;

  if (canManage) {
    return (
      <div className="col-span-12 w-full">
        <header className="flex items-end justify-between gap-5 border-b pb-6">
          <h1 className="font-display text-4xl font-semibold tracking-wide sm:text-5xl">
            Learning Groups
          </h1>
          <span className="font-mono text-sm text-muted-foreground">
            <strong className="text-foreground">{organisations.length}</strong> groups
          </span>
        </header>

        <div className="grid gap-8 pt-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          {organisations.length ? (
            <PerformanceData organisations={organisations} isOrgCreator={isOrgCreator} />
          ) : (
            <div className="grid min-h-72 place-items-center border border-dashed px-6 text-center text-sm text-muted-foreground">
              Create a learning group to begin reviewing student performance.
            </div>
          )}

          <aside className="min-w-0 xl:border-l xl:pl-6" aria-labelledby="manage-groups-heading">
            <h2 id="manage-groups-heading" className="text-lg font-semibold">
              Manage groups
            </h2>
            {isOrgCreator && (
              <form
                className="mt-4 flex"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!newOrgName.trim()) return;
                  createOrganisation({
                    variables: {
                      name: newOrgName.trim(),
                      token: localStorage.getItem("accessToken") ?? "",
                    },
                  }).then((result) => {
                    if (result.data?.createOrganisation.errors)
                      setCreateOrganisationErrors(result.data.createOrganisation.errors);
                    else {
                      setCreateOrganisationErrors({});
                      setNewOrgName("");
                      getOrganisations();
                    }
                  });
                }}
              >
                <label className="sr-only" htmlFor="new-group-name">
                  New learning group name
                </label>
                <input
                  id="new-group-name"
                  className="h-10 min-w-0 flex-1 rounded-l-[3px] border border-r-0 border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
                  value={newOrgName}
                  onChange={(event) => setNewOrgName(event.currentTarget.value)}
                  placeholder="New group name"
                />
                <Button
                  type="submit"
                  className="rounded-l-none rounded-r-[3px] px-3"
                  aria-label="Create learning group"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </form>
            )}
            {Object.values(createOrganisationErrors)
              .flat()
              .map((error) => (
                <p key={error.code ?? error.message} className="mt-2 text-xs text-destructive">
                  {error.message}
                </p>
              ))}

            <div className="mt-5 divide-y border-y">
              {organisations.length ? (
                organisations.map((org) => (
                  <div key={org.name} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <strong className="block truncate text-sm">{org.name}</strong>
                        <span className="mt-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          Code {org.invitationCode}
                        </span>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {org.members.length}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => openPeople(org, false)}
                      >
                        <Users className="h-3.5 w-3.5" /> Members
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        aria-label={`Manage ${org.name} managers`}
                        onClick={() => openPeople(org, true)}
                      >
                        <ShieldUser className="h-3.5 w-3.5" />
                      </Button>
                      {isOrgCreator && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Delete ${org.name}`}
                          onClick={() => {
                            setDeleteOrgName(org.name);
                            setActiveModal("confirmDeleteOrg");
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No learning groups yet.
                </p>
              )}
            </div>
          </aside>
        </div>

        <ConfirmDeleteOrg name={deleteOrgName ?? ""} />
        <OrgMembersManagers managers={managersPressed} org={managingOrg} />
      </div>
    );
  }

  if (memberOrganisation) {
    return (
      <div className="col-span-12 mx-auto w-full max-w-4xl">
        <header className="border-b pb-6">
          <h1 className="font-display text-4xl font-semibold tracking-wide sm:text-5xl">
            Learning Groups
          </h1>
        </header>
        <section className="py-7">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Current group
          </span>
          <h2 className="mt-2 text-xl font-semibold">{memberOrganisation.name}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
            Group managers can review your assessment scores, completion history, username, and
            profile name. They cannot access your email, password, or account settings.
          </p>
          <p className="mt-4 text-sm">
            Owner: <strong>@{memberOrganisation.owner.username}</strong>
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="col-span-12 mx-auto w-full max-w-3xl">
      <header className="border-b pb-6">
        <h1 className="font-display text-4xl font-semibold tracking-wide sm:text-5xl">
          Join a Learning Group
        </h1>
      </header>
      <form
        className="grid gap-4 py-7 sm:grid-cols-[minmax(0,1fr)_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!invitationCode.trim()) return;
          joinOrganisation({
            variables: {
              token: localStorage.getItem("accessToken") ?? "",
              invitationCode: invitationCode.trim(),
            },
          }).then((result) => {
            const payload = result.data?.joinOrganisation;
            if (!payload) return;
            setJoinOrganisationResult(payload);
            setJoinOrganisationResultErrors(payload.errors ?? {});
          });
        }}
      >
        <label className="block text-sm font-semibold" htmlFor="invitation-code">
          Invitation code
          <input
            id="invitation-code"
            className="mt-2 h-10 w-full rounded-[3px] border border-input bg-background px-3 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
            value={invitationCode}
            onChange={(event) => setInvitationCode(event.currentTarget.value)}
          />
        </label>
        <Button type="submit" className="self-end gap-2">
          <Check className="h-4 w-4" /> Join group
        </Button>
      </form>
      {joinOrganisationResult?.success && (
        <p className="border-l-2 border-primary pl-3 text-sm text-primary">
          Joined {joinOrganisationResult.organisation.name}.
        </p>
      )}
      {Object.values(joinOrganisationResultErrors)
        .flat()
        .map((error) => (
          <p key={error.code ?? error.message} className="text-sm text-destructive">
            {error.message}
          </p>
        ))}
    </div>
  );
};

export default OrganisationLandingPage;
