import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(){
    return { hasError: true };
  }
  componentDidCatch(error, info){
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught", error, info);
  }
  render(){
    if(this.state.hasError){
      return <div style={{ color:'#ef9a9a' }}>Component failed to render.</div>;
    }
    return this.props.children;
  }
}


