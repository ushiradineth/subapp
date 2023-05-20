import React from "react";

function FormFieldError(props: { error?: string }) {
  return props.error ? (
    <p className="w-full pb-2 text-xs text-red-400">{props.error}</p>
  ) : null;
}

export default FormFieldError;
