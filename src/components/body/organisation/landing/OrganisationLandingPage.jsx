import React, { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUsers, faUserShield, faCheck } from "@fortawesome/free-solid-svg-icons";
import { gql, useApolloClient, useMutation } from "@apollo/client";
import { ModalContext } from "../../../../contexts/ModalContext";
import ConfirmDeleteOrg from "../../../modals/ConfirmDeleteOrg";
import OrgMembersManagers from "../../../modals/OrgMembersManagers";
import PerformanceData from "../PerformanceData";

const OrganisationLandingPage = () => {
  const [activeModal, setActiveModal] = useContext(ModalContext);

  const [managersPressed, setManagersPressed] = useState(false);
  const [managingOrg, setManagingOrg] = useState(null);
  const [isOrgCreator, setIsOrgCreator] = useState(false);
  const [organisations, setOrganisations] = useState(null);
  const [memberOrganisation, setMemberOrganisation] = useState(null);
  const [managerOrganisations, setManagerOrganisations] = useState([]);
  const [newOrgName, setNewOrgName] = useState("");
  const [createOrganisationResult, setCreateOrganisationResult] = useState(null);
  const [createOrganisationErrors, setCreateOrganisationErrors] = useState({});
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteOrgName, setDeleteOrgName] = useState(null);

  const client = useApolloClient();

  const checkPermissions = () => {
    client
      .query({
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
        if (result.data.me) {
          setManagerOrganisations(result.data.me.managerOf);
          setIsOrgCreator(result.data.me.isOrgCreator);
          result.data.me.managerOf !== null && result.data.me.memberOf && setMemberOrganisation(result.data.me.memberOf[0]);
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
      })
      .then((result) => {
        if (result.data.getOrganisations) {
          setOrganisations(result.data.getOrganisations);
          setLoading(false);
        }
      })
      .catch((errors) => window.location.reload());
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

  const [joinOrganisation] = useMutation(gql`
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

  const [joinOrganisationResult, setJoinOrganisationResult] = useState(null);
  const [joinOrganisationResultErrors, setJoinOrganisationResultErrors] = useState({});

  useEffect(() => {
    checkPermissions();
    getOrganisations();
  }, [activeModal]);

  return (
    !loading &&
    (isOrgCreator || managerOrganisations.length > 0 ? (
      <div className="container">
        {isOrgCreator ? (
          <div className="tile">
            <div className="tile is-parent">
              <div className="tile is-child box">
                <p className="title is-size-4">Organisation Creation</p>
                <hr className="is-divider mt-2" />
                <p>Congratulations! You have been granted permission to create and manage organisations. If you have any organisations, you can see them below. If not, you can create a new one.</p>
                <br />
                <p>
                  If at any point you run into issues, please contact us at <a href="mailto:support@ossat.io">support@ossat.io</a>.
                </p>
              </div>
            </div>
            <div className="tile is-parent">
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
                      <button className="button is-primary has-tooltip-arrow has-tooltip-top" data-tooltip="Create Organisation" type="submit">
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    </div>
                  </div>
                  {Object.keys(createOrganisationErrors).length > 0
                    ? Object.keys(createOrganisationErrors).map((key) => {
                        let error = createOrganisationErrors[key];
                        return (
                          <p key={`create-org-err-${error[0].key}`} className="help is-danger">
                            {error[0].message}
                          </p>
                        );
                      })
                    : createOrganisationResult && <p className="help is-success">Successfully created Organisation!</p>}
                </form>

                {!organisations ? (
                  <p>You haven't created any organisations yet!</p>
                ) : (
                  <>
                    <table className="table is-fullwidth mb-0">
                      <thead>
                        <tr>
                          <th className="px-1">Name</th>
                          <th className="px-1">Invitation Code</th>
                          <th className="has-text-right px-1">Operations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {organisations.map((org) => {
                          let name = org.name;
                          let invitationCode = org.invitationCode;
                          return (
                            <tr key={name}>
                              <td className="is-vcentered px-1" style={{ wordBreak: "break-all" }}>
                                {name}
                              </td>
                              <td className="is-vcentered px-1">{invitationCode}</td>
                              <td className="px-1 is-vcentered">
                                <div className="field has-addons is-pulled-right">
                                  <span className="control">
                                    <a
                                      href="/#"
                                      className="button is-primary has-tooltip-arrow has-tooltip-bottom"
                                      data-tooltip="Show Managers"
                                      type="submit"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        setManagersPressed(true);
                                        setManagingOrg(org);
                                        setActiveModal("orgMembersManagers");
                                      }}
                                    >
                                      <FontAwesomeIcon icon={faUserShield} />
                                    </a>
                                  </span>
                                  <span className="control">
                                    <a
                                      href="/#"
                                      className="button is-primary has-tooltip-arrow has-tooltip-bottom"
                                      data-tooltip="Show Members"
                                      type="submit"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        setManagersPressed(false);
                                        setManagingOrg(org);
                                        setActiveModal("orgMembersManagers");
                                      }}
                                    >
                                      <FontAwesomeIcon icon={faUsers} />
                                    </a>
                                  </span>
                                  <span className="control">
                                    <a
                                      href="/#"
                                      className="button is-danger has-tooltip-arrow has-tooltip-bottom"
                                      data-tooltip="Delete"
                                      type="submit"
                                      onClick={(event) => {
                                        event.preventDefault();
                                        setDeleteOrgName(name);
                                        setActiveModal("confirmDeleteOrg");
                                      }}
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </a>
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <ConfirmDeleteOrg name={deleteOrgName} />
                  </>
                )}
              </div>
            </div>
            <OrgMembersManagers managers={managersPressed} org={managingOrg} />
          </div>
        ) : (
          <div className="tile">
            <div className="tile is-parent">
              <div className="tile is-child box">
                <p className="title is-size-4">Organisation Management</p>
                <hr className="is-divider mt-2" />
                <p>
                  Congratulations! The organisation owner has granted you permission to manage the <strong>{organisations[0].name}</strong> organisation. You can view all members performance
                  statistics in the box below.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className="tile">
          <div className="tile is-parent">
            <PerformanceData organisations={organisations} isOrgCreator={isOrgCreator} />
          </div>
        </div>
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
            If you are a student, you can join an organisation below using the invitation code provided to you. You may only join one organisation at a time.
            <strong>
              <em>Please note</em>: Organisation managers will be able to see your entire assessment performance data once you join.
            </strong>
          </p>
          <br />
          <div className="field has-addons">
            <div className="control is-expanded">
              <input className="input" type="text" placeholder="Invitation Code" onChange={(event) => setInvitationCode(event.target.value)} />
            </div>
            <div className="control">
              <button
                className="button is-primary has-tooltip-arrow has-tooltip-top"
                data-tooltip="Join Organisation"
                onClick={(event) => {
                  event.preventDefault();
                  joinOrganisation({ variables: { token: localStorage.getItem("accessToken"), invitationCode: invitationCode } }).then((result) => {
                    setJoinOrganisationResult(result);
                    if (!result.data.joinOrganisation.errors) {
                      setJoinOrganisationResultErrors({});
                    } else {
                      setJoinOrganisationResultErrors(result.data.joinOrganisation.errors);
                    }
                  });
                }}
              >
                <FontAwesomeIcon icon={faCheck} />
              </button>
            </div>
          </div>
          {Object.keys(joinOrganisationResultErrors).length > 0
            ? Object.keys(joinOrganisationResultErrors).map((key) => {
                let error = joinOrganisationResultErrors[key];
                return (
                  <p key={`join-org-err=${error[0].code}`} className="help is-danger">
                    {error[0].message}
                  </p>
                );
              })
            : joinOrganisationResult &&
              joinOrganisationResult.data.joinOrganisation.success && <p className="help is-success">Welcome to the {joinOrganisationResult.data.joinOrganisation.organisation.name} Organisation!</p>}
        </div>
      </div>
    ))
  );
};

export default OrganisationLandingPage;
