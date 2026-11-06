from importlib import util
from pathlib import Path


def test_alembic_migration_0003_script():
    migration_file = (
        Path(__file__).parent.parent / "alembic" / "versions" / "0003_hotel_tonight_fields.py"
    )
    assert migration_file.exists(), "0003_hotel_tonight_fields.py miqrasiya faylı mövcud deyil"

    # Module import check
    spec = util.spec_from_file_location("migration_0003", migration_file)
    assert spec is not None
    mod = util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)

    assert hasattr(mod, "upgrade")
    assert hasattr(mod, "downgrade")
    assert mod.revision == "0003_hotel_tonight_fields"
    assert mod.down_revision == "0002_add_user_id_to_guests"
