"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-03-15

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Brands table
    op.create_table(
        'brands',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('website_url', sa.String(), nullable=False),
        sa.Column('brand_name', sa.String(), nullable=False),
        sa.Column('industry', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('audience', sa.Text()),
        sa.Column('tone_of_voice', sa.String()),
        sa.Column('value_proposition', sa.Text()),
        sa.Column('color_palette', JSON),
        sa.Column('typography', JSON),
        sa.Column('emotional_triggers', JSON),
        sa.Column('logo_url', sa.String()),
        sa.Column('products', JSON),
        sa.Column('testimonials', JSON),
        sa.Column('pricing_positioning', sa.String()),
        sa.Column('raw_analysis', JSON),
        sa.Column('analysis_status', sa.String(), server_default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_brands_id', 'brands', ['id'])
    op.create_index('ix_brands_user_id', 'brands', ['user_id'])

    # Creatives table
    op.create_table(
        'creatives',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('brand_id', sa.Integer(), nullable=False),
        sa.Column('creative_id', sa.String(), nullable=False),
        sa.Column('layout_type', sa.String(), nullable=False),
        sa.Column('visual_concept', sa.Text()),
        sa.Column('headline', sa.String(), nullable=False),
        sa.Column('supporting_copy', sa.Text()),
        sa.Column('cta', sa.String()),
        sa.Column('emotional_trigger', sa.String()),
        sa.Column('creative_format', sa.String()),
        sa.Column('aspect_ratio', sa.String(), server_default='1:1'),
        sa.Column('platform', sa.String(), server_default='meta'),
        sa.Column('copy_variations', JSON),
        sa.Column('predicted_ctr', sa.Float(), server_default='0.0'),
        sa.Column('engagement_score', sa.Float(), server_default='0.0'),
        sa.Column('scroll_stop_score', sa.Float(), server_default='0.0'),
        sa.Column('emotional_impact_score', sa.Float(), server_default='0.0'),
        sa.Column('performance_rank', sa.Integer(), server_default='0'),
        sa.Column('design_data', JSON),
        sa.Column('preview_url', sa.String()),
        sa.Column('export_urls', JSON),
        sa.Column('status', sa.String(), server_default='draft'),
        sa.Column('is_favorite', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
        sa.ForeignKeyConstraint(['brand_id'], ['brands.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('creative_id'),
    )
    op.create_index('ix_creatives_id', 'creatives', ['id'])
    op.create_index('ix_creatives_creative_id', 'creatives', ['creative_id'])

    # Creative variations table
    op.create_table(
        'creative_variations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('creative_id', sa.Integer(), nullable=False),
        sa.Column('variation_type', sa.String()),
        sa.Column('content', sa.Text()),
        sa.Column('performance_score', sa.Float(), server_default='0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['creative_id'], ['creatives.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # Campaigns table
    op.create_table(
        'campaigns',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('brand_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('objective', sa.String()),
        sa.Column('platform', sa.String()),
        sa.Column('target_audience', JSON),
        sa.Column('budget', sa.Float()),
        sa.Column('creative_ids', JSON),
        sa.Column('status', sa.String(), server_default='draft'),
        sa.Column('intelligence_report', JSON),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True)),
        sa.ForeignKeyConstraint(['brand_id'], ['brands.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # Assets table
    op.create_table(
        'assets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('brand_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('asset_type', sa.String()),
        sa.Column('file_url', sa.String()),
        sa.Column('thumbnail_url', sa.String()),
        sa.Column('file_size', sa.Integer()),
        sa.Column('mime_type', sa.String()),
        sa.Column('metadata', JSON),
        sa.Column('tags', JSON),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['brand_id'], ['brands.id']),
        sa.PrimaryKeyConstraint('id'),
    )


def downgrade() -> None:
    op.drop_table('assets')
    op.drop_table('campaigns')
    op.drop_table('creative_variations')
    op.drop_table('creatives')
    op.drop_table('brands')
