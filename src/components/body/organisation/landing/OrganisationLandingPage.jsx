import React, { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUsers, faUserShield, faBuilding } from "@fortawesome/free-solid-svg-icons";
import { gql, useApolloClient, useMutation } from "@apollo/client";
import { ModalContext } from "../../../../contexts/ModalContext";
import OrgMembersManagers from "../../../modals/OrgMembersManagers";
import PerformanceData from "../PerformanceData";

const OrganisationLandingPage = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);

  const [managersPressed, setManagersPressed] = useState(false);
  const [managingOrg, setManagingOrg] = useState(null);
  const [isOrgManager, setIsOrgManager] = useState(false);
  const [organisations, setOrganisations] = useState(null);
  const [memberOrganisation, setMemberOrganisation] = useState(null);
  const [newOrgName, setNewOrgName] = useState("");
  const [createOrganisationResult, setCreateOrganisationResult] = useState(null);
  const [createOrganisationErrors, setCreateOrganisationErrors] = useState({});
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);

  const client = useApolloClient();

  const checkPermissions = () => {
    client
      .query({
        fetchPolicy: "network-only",
        query: gql`
          query GetUserInfo {
            me {
              isOrgManager
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
        if (result.data.me) {
          setIsOrgManager(result.data.me.isOrgManager);
          !isOrgManager && result.data.me.memberOf && setMemberOrganisation(result.data.me.memberOf[0]);
        }
      });
  };

  const getOrganisations = () => {
    client
      .query({
        fetchPolicy: "network-only",
        query: gql`
          query GetOrganisations {
            getOrganisations( token: "${localStorage.getItem("accessToken")}") {
              name
              inviteCode
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
      })
      .then((result) => {
        if (result.data.getOrganisations) {
          setOrganisations(result.data.getOrganisations);
          setLoading(false);
        }
      });
  };

  const [createOrganisation] = useMutation(gql`
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

  const [deleteOrganisation] = useMutation(gql`
    mutation DeleteOrganisation($name: String!, $token: String!) {
      deleteOrganisation(name: $name, token: $token) {
        success
        errors
      }
    }
  `);

  const [joinOrganisation] = useMutation(gql`
    mutation joinOrganisation($token: String!, $inviteCode: String!) {
      joinOrganisation(token: $token, inviteCode: $inviteCode) {
        success
        errors
        organisation {
          name
        }
      }
    }
  `);

  const [joinOrganisationResult, setJoinOrganisationResult] = useState(null);
  const [joinOrganisationResultErrors, setJoinOrganisationResultErrors] = useState({});

  useEffect(() => {
    checkPermissions();
    getOrganisations();
  }, [activeModal]);

  return (
    !loading &&
    (isOrgManager ? (
      <div className="tile is-vertical is-parent is-12 container">
        <div className="tile is-child box">
          <p className="title is-size-4">Organisation Management</p>
          <hr className="is-divider mt-2" />
          <p>Congratulations! You have been granted permission to create and manage organisations. If you have any organisations, you can see them below. If not, you can create a new one.</p>
          <br />
          <p>
            If at any point you run into issues, please contact us at <a href="mailto:support@ossat.io">support@ossat.io</a>.
          </p>
        </div>
        <div className="tile is-child box">
          <p className="title is-size-4">My Organisations</p>
          <hr className="is-divider mt-2" />
          <form
            className="pb-3"
            onSubmit={(event) => {
              event.preventDefault();
              newOrgName !== "" &&
                createOrganisation({ variables: { name: newOrgName, token: localStorage.getItem("accessToken") } }).then((result) => {
                  setCreateOrganisationResult(result);
                  if (result.data.createOrganisation.errors) {
                    setCreateOrganisationErrors(result.data.createOrganisation.errors);
                  } else {
                    setCreateOrganisationErrors({});
                    getOrganisations();
                  }
                });
            }}
          >
            <div className="field has-addons">
              <div className="control is-expanded">
                <input className="input" type="text" onInput={(event) => setNewOrgName(event.target.value)} placeholder="Organisation Name" />
              </div>
              <div className="control">
                <button className="button is-primary" type="submit">
                  <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                  Create Organisation
                </button>
              </div>
            </div>
            {Object.keys(createOrganisationErrors).length > 0
              ? Object.keys(createOrganisationErrors).map((key) => {
                  let error = createOrganisationErrors[key];
                  return <p className="help is-danger">{error[0].message}</p>;
                })
              : createOrganisationResult && <p className="help is-success">Successfully created Organisation!</p>}
          </form>

          {!organisations ? (
            <p>You haven't created any organisations yet!</p>
          ) : (
            <table className="table is-fullwidth">
              <thead>
                <tr>
                  <th className="px-1">Name</th>
                  <th className="px-1">Invite Code</th>
                  <th className="has-text-right px-1">Operations</th>
                </tr>
              </thead>
              <tbody>
                {organisations.map((org) => {
                  let name = org.name;
                  let inviteCode = org.inviteCode;
                  return (
                    <tr key={name}>
                      <td className="is-vcentered px-1" style={{ wordBreak: "break-all" }}>
                        {name}
                      </td>
                      <td className="is-vcentered px-1">{inviteCode}</td>
                      <td className="px-1 is-vcentered">
                        <div className="field has-addons is-pulled-right">
                          <span className="control">
                            <a
                              href="/#"
                              className="button is-primary"
                              type="submit"
                              onClick={(event) => {
                                event.preventDefault();
                                setManagersPressed(true);
                                setManagingOrg(org);
                                setActiveModal("orgMembersManagers");
                              }}
                            >
                              <FontAwesomeIcon icon={faUserShield} />
                              <span className="is-hidden-mobile ml-2">Show Managers</span>
                            </a>
                          </span>
                          <span className="control">
                            <a
                              href="/#"
                              className="button is-primary"
                              type="submit"
                              onClick={(event) => {
                                event.preventDefault();
                                setManagersPressed(false);
                                setManagingOrg(org);
                                setActiveModal("orgMembersManagers");
                              }}
                            >
                              <FontAwesomeIcon icon={faUsers} />
                              <span className="is-hidden-mobile ml-2">Show Members</span>
                            </a>
                          </span>
                          <span className="control">
                            <a
                              href="/#"
                              className="button is-danger"
                              type="submit"
                              onClick={(event) => {
                                event.preventDefault();
                                deleteOrganisation({ variables: { name: name, token: localStorage.getItem("accessToken") } }).then((result) => {
                                  getOrganisations();
                                });
                              }}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                              <span className="is-hidden-mobile ml-2">Delete</span>
                            </a>
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <OrgMembersManagers managers={managersPressed} org={managingOrg} />
        <PerformanceData organisations={organisations} />
      </div>
    ) : memberOrganisation ? (
      <div className="tile is-vertical is-parent is-12 container">
        <div className="tile is-child box">
          <p className="title is-size-4">My Organisation - {memberOrganisation.name}</p>
          <hr className="is-divider mt-2" />
          <div className="content">
            <p>
              You are a member of the {memberOrganisation.name} Organisation! As a member of this organisation, the owner and managers <strong>can see</strong> the following:
            </p>
            <ul>
              <li>Your performance data for General Quizzes.</li>
              <li>Your performance data for the Generated Assessment.</li>
              <li>Your performance data for the Initial Assessment.</li>
              <li>Your full name (if provided in your profile).</li>
            </ul>
            <p>
              They <strong>cannot see</strong> (or change):
            </p>
            <ul>
              <li>Your email.</li>
              <li>Your password.</li>
            </ul>
            <p>
              <em>
                If you wish to leave the organisation, you should contact the Organisation owner, <strong>{memberOrganisation.owner.username}</strong>.
              </em>
            </p>{" "}
          </div>
        </div>
      </div>
    ) : (
      <div className="tile is-vertical is-parent is-12 container">
        <div className="tile is-child box">
          <p className="title is-size-4">
            <strong>Join an Organisation</strong>
          </p>
          <hr className="is-divider mt-2" />
          <p>You can join an organisation here. These may be created by class teachers or other collaborators who have been granted permission to do so by the OSSAT administration team.</p>
          <br />
          <p>
            If you would like to be granted permission to create organisations, please email <a href="mailto:staffrequests@ossat.io">staffrequests@ossat.io</a> with details of your intended use case
            and we will review your request.
          </p>
          <br />
          <p>
            If you are a student, you can join an organisation below using the invite code provided to you. You may only join one organisation at a time.
            <strong>
              <em>Please note</em>: Organisation managers will be able to see your entire assessment performance data once you join.
            </strong>
          </p>
          <br />
          <div className="field has-addons">
            <div className="control is-expanded">
              <input className="input" type="text" placeholder="Invite Code" onChange={(event) => setInviteCode(event.target.value)} />
            </div>
            <div className="control">
              <button
                className="button is-primary"
                onClick={(event) => {
                  event.preventDefault();
                  joinOrganisation({ variables: { token: localStorage.getItem("accessToken"), inviteCode: inviteCode } }).then((result) => {
                    setJoinOrganisationResult(result);
                    if (!result.data.joinOrganisation.errors) {
                      setJoinOrganisationResultErrors({});
                    } else {
                      setJoinOrganisationResultErrors(result.data.joinOrganisation.errors);
                    }
                  });
                }}
              >
                <FontAwesomeIcon icon={faBuilding} className="mr-2" />
                Join Organisation
              </button>
            </div>
          </div>
          {Object.keys(joinOrganisationResultErrors).length > 0
            ? Object.keys(joinOrganisationResultErrors).map((key) => {
                let error = joinOrganisationResultErrors[key];
                return <p className="help is-danger">{error[0].message}</p>;
              })
            : joinOrganisationResult &&
              joinOrganisationResult.data.joinOrganisation.success && <p className="help is-success">Welcome to the {joinOrganisationResult.data.joinOrganisation.organisation.name} Organisation!</p>}
        </div>
      </div>
    ))
  );
};

export default OrganisationLandingPage;
