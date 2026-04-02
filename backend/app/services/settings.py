from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import AppSetting


def get_settings_map(session: Session) -> dict:
    return {setting.key: setting.value for setting in session.scalars(select(AppSetting)).all()}


def update_settings_map(session: Session, values: dict) -> dict:
    for key, value in values.items():
        setting = session.scalar(select(AppSetting).where(AppSetting.key == key))
        if not setting:
            setting = AppSetting(key=key, value=value)
            session.add(setting)
        else:
            setting.value = value
    session.commit()
    return get_settings_map(session)
