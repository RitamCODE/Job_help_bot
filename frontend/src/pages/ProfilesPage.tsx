import { useEffect, useState } from "react";

import { api } from "../api/client";
import { Profile } from "../types";

export function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    void api.getProfiles().then((data) => setProfiles(data as Profile[]));
  }, []);

  return (
    <div className="page card">
      <div className="section-title">
        <h2>Search profiles</h2>
        <p className="muted">Each job can be scored against multiple parallel role tracks.</p>
      </div>
      {profiles.map((profile) => (
        <article key={profile.id} className="stack-card">
          <strong>{profile.name}</strong>
          <p>{profile.description}</p>
          <p className="muted">Roles: {profile.target_roles.join(", ")}</p>
          <p className="muted">Skills: {profile.skills.join(", ")}</p>
        </article>
      ))}
    </div>
  );
}
