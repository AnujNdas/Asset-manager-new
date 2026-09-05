
import React, { useEffect, useState, useMemo } from "react";
import { getSubscription} from "../../Services/AdminServices"
const Financial = () => {
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await getSubscription();
      console.log("subscription:", res);
    } catch (err) {
      console.log("Error", "Failed to load login activity", "error");
    }
  };
  return (
    <div>Financial</div>
  )
}

export default Financial