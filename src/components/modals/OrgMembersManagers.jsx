import React, { useContext, useEffect, useState } from "react";
import { ModalContext } from "../../contexts/ModalContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserSlash, faAngleDoubleUp, faAngleDoubleDown } from "@fortawesome/free-solid-svg-icons";
import { gql, useMutation } from "@apollo/client";

const OrgMembersManagers = ({ managers, org }) => {
  const [activeModal, setActiveModal] = useContext(ModalContext);
  const [managersOrMembers, setManagersOrMembers] = useState([]);
  const [page, setPage] = useState(1);

  const [kickOrganisationMember] = useMutation(gql`
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

  const [promoteOrganisationMember] = useMutation(gql`
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

  const [demoteOrganisationManager] = useMutation(gql`
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
    org && (managers ? setManagersOrMembers(org.managers) : setManagersOrMembers(org.members));
    setPage(1);
  }, [activeModal]);

  return (
    <div className={`modal p-3 ${activeModal === "orgMembersManagers" ? "is-active" : ""}`}>
      <div className="modal-background" />
      <div className="modal-card">
        <header className="modal-card-head">
          <p className="modal-card-title">Organisation {managers ? "Managers" : "Members"}</p>
          <button
            className="delete"
            onClick={(event) => {
              event.preventDefault();
              setActiveModal(null);
            }}
          />
        </header>
        <section className="modal-card-body">
          <div className="content">
            {managersOrMembers.length === 0 ? (
              <p>
                There are currently no {managers ? "Managers" : "Members"} of this organisation.{managers ? "" : " Please distribute the Invite Code to users who you wish to join."}
              </p>
            ) : (
              <>
                <table className="table is-fullwidth">
                  <thead>
                    <tr>
                      <th className="px-1">Username</th>
                      <th className="px-1">First Name</th>
                      <th className="px-1">Last Name</th>
                      <th className="has-text-right px-1">Operations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managersOrMembers.length > 0 &&
                      Object.keys(managersOrMembers)
                        .slice(page * 10 - 10, page * 10)
                        .map((key) => {
                          let user = managersOrMembers[key];
                          return (
                            <tr key={user.username}>
                              <td className="is-vcentered px-1">{user.username}</td>
                              <td className="is-vcentered px-1">{user.firstName}</td>
                              <td className="is-vcentered px-1">{user.lastName}</td>
                              <td className="is-vcentered px-1">
                                <div className="field has-addons is-pulled-right">
                                  <span className="control">
                                    <a
                                      href="/#"
                                      className={`button ${managers ? "is-warning" : "is-success"}`}
                                      onClick={(event) => {
                                        event.preventDefault();
                                        managers
                                          ? demoteOrganisationManager({ variables: { orgName: org.name, username: user.username, token: localStorage.getItem("accessToken") } }).then((result) => {
                                              if (result.data.demoteOrganisationManager.success) {
                                                org = result.data.demoteOrganisationManager.organisation;
                                                setManagersOrMembers(result.data.demoteOrganisationManager.organisation.managers);
                                              }
                                            })
                                          : promoteOrganisationMember({ variables: { orgName: org.name, username: user.username, token: localStorage.getItem("accessToken") } }).then((result) => {
                                              if (result.data.promoteOrganisationMember.success) {
                                                org = result.data.promoteOrganisationMember.organisation;
                                                setManagersOrMembers(result.data.promoteOrganisationMember.organisation.members);
                                              }
                                            });
                                      }}
                                    >
                                      <FontAwesomeIcon icon={managers ? faAngleDoubleDown : faAngleDoubleUp} />
                                      <span className="is-hidden-mobile ml-2">{managers ? "Demote" : "Promote"}</span>
                                    </a>
                                  </span>
                                  {!managers && (
                                    <span className="control">
                                      <a
                                        href="/#"
                                        className="button is-danger"
                                        onClick={(event) => {
                                          event.preventDefault();
                                          kickOrganisationMember({ variables: { orgName: org.name, username: user.username, token: localStorage.getItem("accessToken") } }).then((result) => {
                                            if (result.data.kickOrganisationMember.success) {
                                              org = result.data.kickOrganisationMember.organisation;
                                              setManagersOrMembers(result.data.kickOrganisationMember.organisation.members);
                                            }
                                          });
                                        }}
                                      >
                                        <FontAwesomeIcon icon={faUserSlash} />
                                        <span className="is-hidden-mobile ml-2">Kick</span>
                                      </a>
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
                <nav className="pagination" role="navigation" aria-label="pagination">
                  <a
                    href="/#"
                    className="pagination-previous is-primary"
                    onClick={(event) => {
                      event.preventDefault();
                      page > 1 && setPage(page - 1);
                    }}
                  >
                    Previous
                  </a>
                  <a
                    href="/#"
                    className="pagination-next is-primary"
                    onClick={(event) => {
                      event.preventDefault();
                      page < Math.floor(managersOrMembers.length / 10) + 1 && setPage(page + 1);
                    }}
                  >
                    Next
                  </a>
                  <ul className="pagination-list m-1">
                    <li>
                      <a
                        href="/#"
                        className={`pagination-link ${page === 1 && "is-current has-background-primary"}`}
                        onClick={(event) => {
                          event.preventDefault();
                          setPage(1);
                        }}
                      >
                        1
                      </a>
                    </li>

                    {managersOrMembers.length > 20 && (
                      <>
                        <li>
                          <span className="pagination-ellipsis">&hellip;</span>
                        </li>
                        <li>
                          <a
                            href="/#"
                            className={`pagination-link ${page === Math.floor(managersOrMembers.length / 10) && "is-current has-background-primary"}`}
                            onClick={(event) => {
                              event.preventDefault();
                              setPage(Math.floor(managersOrMembers.length / 10));
                            }}
                          >
                            {Math.floor(managersOrMembers.length / 10)}
                          </a>
                        </li>
                        <li>
                          <a
                            href="/#"
                            className={`pagination-link ${page === Math.floor(managersOrMembers.length / 10) + 1 && "is-current has-background-primary"}`}
                            onClick={(event) => {
                              event.preventDefault();
                              setPage(Math.floor(managersOrMembers.length / 10) + 1);
                            }}
                          >
                            {Math.floor(managersOrMembers.length / 10) + 1}
                          </a>
                        </li>
                      </>
                    )}
                  </ul>
                </nav>
              </>
            )}
          </div>
        </section>
        <footer className="modal-card-foot">
          <a
            className="button"
            href="/#"
            onClick={(event) => {
              event.preventDefault();
              setActiveModal(null);
            }}
          >
            Close
          </a>
        </footer>
      </div>
    </div>
  );
};

export default OrgMembersManagers;
