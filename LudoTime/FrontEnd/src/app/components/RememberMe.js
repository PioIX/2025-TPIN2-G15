"use client";

import { useEffect, useState } from "react";
import {
  loadRememberFlag,
  saveRememberFlag,
  saveRememberedEmail,
} from "../lib/authStorage";

export default function RememberMe({ checked, onChange, email }) {
  const [internal, setInternal] = useState(checked ?? false);

  useEffect(() => {
    if (checked === undefined) {
      setInternal(loadRememberFlag());
    }
  }, [checked]);

  useEffect(() => {
    saveRememberFlag(internal);
    if (internal && email) saveRememberedEmail(email);
  }, [internal, email]);

  const toggle = () => {
    const next = !internal;
    setInternal(next);
    onChange?.(next);
  };

  return (
    <label className="rememberRowOverride" onClick={toggle}>
      <input
        type="checkbox"
        checked={internal}
        onChange={toggle}
        onClick={(e) => e.stopPropagation()}
      />
      <span>Recordame...</span>
      <style jsx>{`
        .rememberRowOverride {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          user-select: none;
          color: #1b0431;
          font-size: 16px;
          margin-top: 20px;
          cursor: pointer;
        }
        .rememberRowOverride input {
          width: 18px;
          height: 18px;
        }
      `}</style>
    </label>
  );
}