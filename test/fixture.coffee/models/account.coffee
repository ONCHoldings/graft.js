class Account extends Graft.BaseModel
  urlRoot: "/api/Account"
  defaults:
    group: "default"
  status: "offline"

module.export = Account
