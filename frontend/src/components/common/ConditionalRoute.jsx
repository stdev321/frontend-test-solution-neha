// ConditionalRoute.jsx - Wrapper to conditionally render routes based on feature flags
import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function ConditionalRoute({ condition, children, redirectTo = '/' }) {
  if (!condition) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return children;
}

ConditionalRoute.propTypes = {
  condition: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  redirectTo: PropTypes.string,
};

export default ConditionalRoute;