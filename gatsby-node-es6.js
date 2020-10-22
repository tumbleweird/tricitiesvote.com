import path from 'path';
// import { buildCandidateFields, buildMarkdown, buildSlugs } from './node';
import SchemaCustomization from './schema';
import GraphQLSchema from './graphql';

const _ = require('lodash');
const remark = require('remark');
const remarkHTML = require('remark-html');
const truncate = require('truncate-html');

// const buildBits = [buildSlugs, buildMarkdown, buildCandidateFields];
//
// exports.onCreateNode = helpers => {
//   buildBits.forEach(bit => bit.onCreateNode(helpers));
// };

exports.onCreateNode = ({ node, actions }) => {
  const { createNodeField } = actions;

  if (node.internal.type === 'GuidesJson') {
    const region = node.region.slice(0, node.region.indexOf(' '));
    createNodeField({
      node,
      name: `slug`,
      value: _.kebabCase(region),
    });
  }

  // build slug contents for Races
  if (node.internal.type === 'RacesJson') {
    createNodeField({
      node,
      name: `slug`,
      value: _.kebabCase(node.office),
    });
  }

  // build slug contents for Candidates
  if (node.internal.type === 'CandidatesJson' && node.name) {
    createNodeField({
      node,
      name: `slug`,
      value: _.kebabCase(node.name),
    });
  }

  const markdownFields = [
    {
      name: 'lettersyes',
      data: node.lettersyes,
      wrap: false,
      excerpt: false,
    },
    {
      name: 'lettersno',
      data: node.lettersno,
      wrap: false,
      excerpt: false,
    },
    {
      name: 'articles',
      data: node.articles,
      wrap: true,
      excerpt: false,
    },
    {
      name: 'engagement',
      data: node.engagement,
      wrap: true,
      excerpt: false,
    },
    {
      name: 'bio',
      data: node.bio,
      wrap: true,
      excerpt: 160,
    },
    {
      name: 'statement',
      data: node.statement,
      wrap: true,
      excerpt: 240,
    },
    {
      name: 'body',
      data: node.body,
      wrap: true,
      excerpt: 240,
    },
    {
      name: 'notes',
      data: node.notes,
      wrap: true,
      excerpt: 240,
    },
  ];

  markdownFields.forEach((item, key) => {
    const fieldName = markdownFields[key].name;
    const fieldData = markdownFields[key].data;
    const { wrap } = markdownFields[key];
    const { excerpt } = markdownFields[key];

    // console.log(excerpt)

    // console.log(fieldData);

    if (fieldData) {
      // console.log('hi');
      const wrapValue = remark()
        .use(remarkHTML)
        .processSync(fieldData)
        .toString();

      const noWrapValue = remark()
        .use(remarkHTML)
        .processSync(fieldData)
        .toString()
        .slice(3)
        .slice(0, -5); // remove <p> and </p>

      if (wrap) {
        // create new node at:
        // fields { fieldName_html }
        // console.log('wrap', fieldName, wrapValue);
        createNodeField({
          name: `${fieldName}_html`,
          node,
          value: wrapValue,
        });
      }

      if (!wrap) {
        // create new unwrapped node at:
        // fields { fieldName_html_nowrap }
        // console.log('nowrap', fieldName, noWrapValue);
        createNodeField({
          name: `${fieldName}_html_nowrap`,
          node,
          value: noWrapValue,
        });
      }

      // console.log(excerpt)

      if (excerpt > 0) {
        const excerptValue = truncate(wrapValue, excerpt, {
          reserveLastWord: true,
        });
        // create new node at:
        // fields { fieldName_excerpt_html }
        createNodeField({
          name: `${fieldName}_excerpt_html`,
          node,
          // value: 'hi'
          value: excerptValue,
        });
      }
    }
  });

  if (node.internal.type === 'CandidatesJson' && node.uuid) {
    createNodeField({
      node,
      name: `fundraising`,
      value: _.kebabCase(_.lowerCase(`${node.uuid}-funding`)),
    });
  }
};

exports.createSchemaCustomization = helpers => {
  const { actions } = helpers;
  const { createTypes } = actions;
  try {
    createTypes(SchemaCustomization);
  } catch (error) {
    console.log(error);
  }
};

exports.createPages = async ({
  actions: { createPage },
  graphql,
  reporter,
}) => {
  const results = await graphql(GraphQLSchema);

  if (results.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`);
    console.log(results.errors);
  }

  const allCandidates = results.data.candidates.edges;
  const allGuides = results.data.guides.edges;
  const allRaces = results.data.races.edges;
  const allNotes = results.data.notes.edges;

  allCandidates.forEach(candidate => {
    createPage({
      path: `/${candidate.node.fields.slug}/`,
      component: path.resolve('./src/templates/CandidatePage.js'),
      context: {
        slug: candidate.node.fields.slug,
      },
    });
  });

  allCandidates.forEach(candidate => {
    createPage({
      path: `/${candidate.node.fields.slug}/preview`,
      component: path.resolve('./src/templates/CandidatePagePreview.js'),
      context: {
        slug: candidate.node.fields.slug,
      },
    });
  });

  allNotes.forEach(note => {
    createPage({
      path: `/${note.node.candidate.fields.slug}/notes`,
      component: path.resolve('./src/templates/NotesPage.js'),
      context: {
        slug: note.node.candidate.fields.slug,
      },
    });
  });

  allRaces.forEach(race => {
    createPage({
      path: `/${race.node.fields.slug}/`,
      component: path.resolve('./src/templates/RacePage.js'),
      context: {
        slug: race.node.fields.slug,
      },
    });
  });

  allRaces.forEach(race => {
    createPage({
      path: `/${race.node.fields.slug}/preview`,
      component: path.resolve('./src/templates/RacePagePreview.js'),
      context: {
        slug: race.node.fields.slug,
      },
    });
  });

  allGuides.forEach(guide => {
    createPage({
      path: `/${guide.node.fields.slug}/`,
      component: path.resolve('./src/templates/GuidePage.js'),
      context: {
        slug: guide.node.fields.slug,
      },
    });
  });
};
