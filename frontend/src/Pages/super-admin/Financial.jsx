// BillingPage.jsx

import React from "react";
import { NavLink, Outlet , Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCashRegister,
  faMoneyBill,
  faBitcoinSign
} from "@fortawesome/free-solid-svg-icons"; 
import "../../Page_styles/LandingPage/Financials.css";


const BillingPage = () => {

  return (

    <div className="billing-page">

      {/* ============================
          HEADER
      ============================ */}

      <div className="billing-page-header">

        <div>

          <h1 className="billing-page-title">
            Billing & Revenue
          </h1>

          <p className="billing-page-subtitle">
            Manage organization subscriptions, affiliate referrals,
            commissions and revenue.
          </p>

        </div>

      </div>


      {/* ============================
          INTERNAL NAVIGATION
      ============================ */}

      <div className="billing-tabs-wrapper">

        <nav className="billing-tabs">

          {/* SUBSCRIPTIONS */}

          <NavLink
            to="subscriptions"
            className={({ isActive }) =>
              `billing-tab ${isActive ? "billing-tab-active" : ""}`
            }
          >

            <FontAwesomeIcon icon={faCashRegister}/>

            <span>
              Subscriptions
            </span>

          </NavLink>


          {/* REFERRALS */}

          <NavLink
            to="referrals"
            className={({ isActive }) =>
              `billing-tab ${isActive ? "billing-tab-active" : ""}`
            }
          >

            <FontAwesomeIcon icon={faMoneyBill}/>

            <span>
              Referrals
            </span>

          </NavLink>


          {/* REVENUE */}

          <NavLink
            to="revenue"
            className={({ isActive }) =>
              `billing-tab ${isActive ? "billing-tab-active" : ""}`
            }
          >

            <FontAwesomeIcon icon={faBitcoinSign}/>

            <span>
              Revenue
            </span>

          </NavLink>

        </nav>

      </div>


      {/* ============================
          CHILD PAGE CONTENT
      ============================ */}

      <div className="billing-page-content">

        <Outlet />

      </div>

    </div>

  );

};


export default BillingPage;